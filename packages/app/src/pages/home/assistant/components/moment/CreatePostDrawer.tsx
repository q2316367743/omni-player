import {DrawerPlugin, Input, Textarea, Button} from "tdesign-vue-next";
import XhUploadImage from "@/components/avatar/XhUploadImage.vue";
import {createPostByUser} from "@/services/memo/post/CreatePostByUser.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import "./CreatePostDrawer.less";

interface CreatePostFormData {
  content: string;
  media_urls: string[];
  location: string;
}

export function openCreatePostDrawer(onSuccess?: () => void) {
  const formData = ref<CreatePostFormData>({
    content: '',
    media_urls: [],
    location: ''
  });

  const canPublish = computed(() => {
    return formData.value.content.trim() || formData.value.media_urls.length > 0;
  });

  const handlePublish = async () => {
    if (!formData.value.content.trim() && formData.value.media_urls.length === 0) {
      MessageUtil.warning('请输入内容或上传图片');
      return;
    }

    try {
      await createPostByUser({
        content: formData.value.content,
        media_urls: JSON.stringify(formData.value.media_urls),
        location: formData.value.location,
        onFinally: () => {
          MessageUtil.success('发布成功');
          plugin.destroy?.();
          onSuccess?.();
        }
      });
    } catch (error) {
      MessageUtil.error('发布失败', error);
    }
  };

  const plugin = DrawerPlugin({
    header: false,
    footer: false,
    closeOnOverlayClick: true,
    size: '600px',
    default: () => <div class="create-post-drawer">
      <div class="drawer-header">
        <Button variant="text" onClick={() => plugin.destroy?.()}>取消</Button>
        <span class="title">发表动态</span>
        <Button variant="text" theme="primary" disabled={!canPublish.value} onClick={handlePublish}>发表</Button>
      </div>
      <div class="drawer-content">
        <div class="content-section">
          <div class="textarea-wrapper">
            <Textarea
              v-model={formData.value.content}
              placeholder={'这一刻的想法...'}
              autosize={{minRows: 6, maxRows: 12}}
              maxlength={500}
              class="content-textarea"
            />
          </div>
        </div>
        <div class="media-section">
          <XhUploadImage
            v-model={formData.value.media_urls}
            size={100}
            maxCount={9}
          />
        </div>
        <div class="location-section">
          <span class="location-icon">📍</span>
          <Input
            v-model={formData.value.location}
            placeholder={'所在位置（可选）'}
            clearable
          />
        </div>
      </div>
    </div>,
    onConfirm: handlePublish
  });
}
