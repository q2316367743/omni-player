import type {SpDialogueCore} from "@/entity/screenplay";
import {DialogPlugin, Form, FormItem, Textarea} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {addSpDialogueService} from "@/services/screenplay";

/**
 * 新增旁白
 */
export function openSpDialogualAddNarrator(
  screenplayId: string,
  sceneId: string,
  onUpdate: () => void) {
  const data = ref<SpDialogueCore>({
    screenplay_id: screenplayId,
    scene_id: sceneId,
    role_id: '',
    type: 'narrator',
    action: '',
    dialogue: ''
  });
  const dp = DialogPlugin({
    header: '推进剧情',
    onConfirm: () => {
      if (!data.value.dialogue) {
        MessageUtil.error("请填写剧情内容");
        return;
      }
      addSpDialogueService(data.value).then(() => {
        onUpdate();
        dp.destroy?.();
        MessageUtil.success("新增成功");
      }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    },
    default: () => (<Form>
      <FormItem label="剧情内容" labelAlign={'top'} name="dialogue">
        <Textarea v-model={data.value.dialogue} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>)
  })
}