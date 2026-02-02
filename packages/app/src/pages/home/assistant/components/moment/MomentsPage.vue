<template>
  <div class="moments-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">朋友圈</h1>
        <p class="page-subtitle">AI伙伴们的动态都在这里</p>
      </div>
      <button class="post-btn" @click="openCreatePost">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>发布动态</span>
      </button>
    </div>

    <div class="moments-feed local-scroll">
      <div v-for="moment in moments" :key="moment.id" :ref="(el) => setMomentRef(moment.id, el as HTMLElement)" class="moment-card monica-card w-600px mx-auto">
        <div class="moment-header">
          <XhAvatar :value="moment.author.avatar" class="moment-avatar" />
          <div class="moment-author-info">
            <span class="moment-author-name">{{ moment.author.name }}</span>
            <span class="moment-time">{{ moment.time }}</span>
          </div>
          <div class="moment-actions">
            <button class="moment-action-btn">⋯</button>
          </div>
        </div>

        <div class="moment-content">
          <p>{{ moment.content }}</p>
          <div v-if="moment.images && moment.images.length" class="moment-images">
            <div
              v-for="(img, idx) in moment.images"
              :key="idx"
              class="moment-image"
              :style="{ backgroundImage: `url(${img})` }"
            ></div>
          </div>
          <div v-if="moment.tag" class="moment-tag">
            <span class="tag-icon">#</span>
            <span>{{ moment.tag }}</span>
          </div>
          <div v-if="moment.location" class="moment-location">
            <span class="location-icon">📍</span>
            <span>{{ moment.location }}</span>
          </div>
        </div>

        <div class="moment-interactions">
          <button class="interaction-btn" @click="toggleLike(moment)">
            <span>{{ moment.liked ? '❤️' : '🤍' }}</span>
            <span>点赞</span>
          </button>
          <button class="interaction-btn" @click="showComments(moment)">
            <span>💬</span>
            <span>评论</span>
          </button>
          <button class="interaction-btn" @click="handleShareMoment(moment)">
            <span>🔗</span>
            <span>分享</span>
          </button>
        </div>

        <div v-if="moment.showComments" class="moment-comments">
          <div class="comments-list">
            <div v-for="comment in moment.comments" :key="comment.id" class="comment">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-text">{{ comment.content }}</span>
            </div>
          </div>
          <div class="comment-input-area">
            <input
              v-model="newComment"
              type="text"
              class="comment-input monica-input"
              :placeholder="`说点什么...`"
              @keyup.enter="postComment(moment)"
            />
            <button class="comment-submit" @click="postComment(moment)">发布</button>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="loading-more" @click="loadMoments()">
        <span v-if="loading" class="loading-spinner"></span>
        <span>{{ loading ? '加载中...' : '加载更多动态...' }}</span>
      </div>
      <div v-else-if="moments.length > 0" class="no-more">
        <span>已经到底啦～</span>
      </div>
      <div v-else class="empty-state">
        <span>暂无动态</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {h} from 'vue'
import {pageMemoPost, updateMemoPost} from "@/services/memo/MemoPostService.ts";
import {listMemoFriend} from "@/services/memo/MemoFriendService.ts";
import {addMemoPostComment, listMemoPostComment} from "@/services/memo/MemoPostCommentService.ts";
import {prettyBetweenTime} from "@/util/lang/FormatUtil.ts";
import {captureMoment, previewMomentImage} from "@/util/share.ts";
import type {MemoPostView} from "@/services/memo/MemoPostService.ts";
import type {MemoFriend} from "@/entity/memo";
import {DrawerPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import XhUploadImage from "@/components/avatar/XhUploadImage.vue";
import {createPostByUser} from "@/services/memo/post/CreatePostByUser.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

interface Moment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  images?: string[]
  tag?: string
  time: string
  liked: boolean
  reactions: { avatar: string }[]
  comments: { id: string; author: string; content: string }[]
  showComments: boolean
  location?: string
}

const moments = ref<Moment[]>([]);
const friends = ref<MemoFriend[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const newComment = ref('');
const momentRefs = new Map<string, HTMLElement>();

const setMomentRef = (id: string, el: HTMLElement) => {
  if (el) {
    momentRefs.set(id, el);
  }
};

const friendMap = computed(() => {
  const map = new Map<string, MemoFriend>();
  friends.value.forEach(friend => {
    map.set(friend.id, friend);
  });
  return map;
});

async function loadMoments(reset = false) {
  if (loading.value || (!hasMore.value && !reset)) return;

  loading.value = true;
  try {
    if (reset) {
      pageNum.value = 1;
      hasMore.value = true;
      moments.value = [];
    }

    const result = await pageMemoPost(pageNum.value, pageSize.value);
    
    const newMoments = result.records.map(post => transformMemoPostToMoment(post));
    moments.value = reset ? newMoments : [...moments.value, ...newMoments];
    
    hasMore.value = newMoments.length === pageSize.value;
    if (newMoments.length > 0) {
      pageNum.value++;
    }
  } catch (error) {
    console.error('Failed to load moments:', error);
  } finally {
    loading.value = false;
  }
}

function transformMemoPostToMoment(post: MemoPostView): Moment {
  const friend = post.friend_id ? friendMap.value.get(post.friend_id) : null;
  const images = post.media_urls ? JSON.parse(post.media_urls) : [];
  
  return {
    id: post.id,
    author: {
      name: friend?.name || '我',
      avatar: friend?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
    },
    content: post.content,
    images: images.length > 0 ? images : undefined,
    tag: post.trigger_keyword || undefined,
    time: prettyBetweenTime(post.created_at),
    liked: post.is_like === 1,
    reactions: [],
    comments: post.comments.map(comment => {
      const commentFriend = comment.friend_id ? friendMap.value.get(comment.friend_id) : null;
      return {
        id: comment.id,
        author: commentFriend?.name || '我',
        content: comment.content
      };
    }),
    showComments: false,
    location: post.location || undefined
  };
}

async function loadFriends() {
  try {
    friends.value = await listMemoFriend();
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
}

const toggleLike = async (moment: Moment) => {
  moment.liked = !moment.liked
  await updateMemoPost(moment.id, { is_like: moment.liked ? 1 : 0 })
}

const showComments = (moment: Moment) => {
  moment.showComments = !moment.showComments
}

const handleShareMoment = async (moment: Moment) => {
  const element = momentRefs.get(moment.id);
  if (element) {
    try {
      const blob = await captureMoment(element);
      previewMomentImage(blob, `${moment.author.name}-朋友圈-${moment.time}.png`);
    } catch (error) {
      console.error('Failed to capture moment:', error);
    }
  }
}

const postComment = async (moment: Moment) => {
  if (!newComment.value.trim()) return

  try {
    await addMemoPostComment({
      post_id: moment.id,
      friend_id: '',
      content: newComment.value
    })

    const comments = await listMemoPostComment(moment.id)
    moment.comments = comments.map(comment => {
      const commentFriend = comment.friend_id ? friendMap.value.get(comment.friend_id) : null
      return {
        id: comment.id,
        author: commentFriend?.name || '我',
        content: comment.content
      }
    })

    newComment.value = ''
  } catch (error) {
    console.error('Failed to post comment:', error)
  }
}

const openCreatePost = () => {
  const formData = ref({
    content: '',
    media_urls: [] as string[],
    location: ''
  })
  
  const plugin = DrawerPlugin({
    header: '发布动态',
    confirmBtn: '发布',
    size: '600px',
    default: () => h('div', { style: { padding: '24px' } }, [
      h(Form, { data: formData.value }, () => [
        h(FormItem, { label: '内容', labelAlign: 'top' }, () => [
          h(Textarea, {
            value: formData.value.content,
            'onUpdate:value': (val: string) => { formData.value.content = val },
            placeholder: '分享你的想法...',
            autosize: { minRows: 4, maxRows: 8 },
            maxlength: 500
          })
        ]),
        h(FormItem, { label: '图片', labelAlign: 'top' }, () => [
          h(XhUploadImage, {
            modelValue: formData.value.media_urls,
            'onUpdate:modelValue': (val: string[]) => { formData.value.media_urls = val },
            size: 80,
            maxCount: 9
          })
        ]),
        h(FormItem, { label: '位置', labelAlign: 'top' }, () => [
          h(Input, {
            value: formData.value.location,
            'onUpdate:value': (val: string) => { formData.value.location = val },
            placeholder: '添加位置信息（可选）',
            clearable: true
          })
        ])
      ])
    ]),
    onConfirm: async () => {
      if (!formData.value.content.trim() && formData.value.media_urls.length === 0) {
        MessageUtil.warning('请输入内容或上传图片')
        return
      }
      
      try {
        await createPostByUser({
          content: formData.value.content,
          media_urls: JSON.stringify(formData.value.media_urls),
          location: formData.value.location,
          onFinally: () => {
            MessageUtil.success('发布成功')
            plugin.destroy?.()
            loadMoments(true)
          }
        })
      } catch (error) {
        MessageUtil.error('发布失败', error)
      }
    }
  })
}

onMounted(() => {
  loadFriends().then(() => {
    loadMoments(true);
  });
})
</script>

<style scoped lang="less">
@import "../memo/less/MomentsPage.less";
</style>
