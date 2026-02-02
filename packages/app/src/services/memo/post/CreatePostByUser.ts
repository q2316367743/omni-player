import {createMemoPost, createPostComment} from "@/services/memo";
import {useMemoVelesdb} from "@/lib/velesdb.ts";
import {logDebug, logError} from "@/lib/log.ts";
import {aiMemoAnalyzer} from "@/modules/ai/memo/AiMemoAnalyzer.ts";

export interface CreatePostByUserProp {
  // 朋友圈内容，支持 md
  content: string;
  // 朋友圈图片，JSON: ['https://example.com/temp.png']
  media_urls: string;
  /**
   * 朋友圈地理位置
   */
  location: string;
  onFinally?: () => void;
}

export async function createPostByUser(prop: CreatePostByUserProp) {
  // 1. 创建朋友圈
  logDebug("[CreatePostByUser] 创建朋友圈");
  const post = await createMemoPost({
    content: prop.content,
    media_urls: prop.media_urls,
    location: prop.location,
    friend_id: '',
    triggered_by: '',
    trigger_keyword: ''
  });
  (async () => {
    // 2. 内容向量化
    try {
      logDebug("[CreatePostByUser] 向量化内容");
      await useMemoVelesdb().addChunkBatch([{
        content: prop.content,
        id: post.created_at,
        payload: {
          content: prop.content,
          id: post.id,
        }
      }])
    } catch (e) {
      logError("[CreatePostByUser] 向量化内容报错", e);
    }
    // 3. 触发 ai 评论
    logDebug("[CreatePostByUser] 触发 ai 评论");
    await createPostComment(post);
    // 4. 触发 ai 总结
    await aiMemoAnalyzer({
      memoContent: post.content,
      source: 'post',
      sourceId: post.id
    })

    logDebug("[CreatePostByUser] 创建完成");
  })().catch(e => {
    logError("[CreatePostByUser] 创建朋友圈报错", e);
  }).finally(prop.onFinally);
}