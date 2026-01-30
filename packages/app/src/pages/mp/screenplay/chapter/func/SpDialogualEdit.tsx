import type {SpDialogueCore} from "@/entity/screenplay";
import {DialogPlugin, Form, FormItem, Textarea, Checkbox} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {addSpDialogueService} from "@/services/screenplay";
import {askAiScreenplayNarrator} from "@/modules/ai/screenplay/AiScreenplayNarrator.ts";
import {getScreenplayService} from "@/services/screenplay/ScreenplayService.ts";
import {getSpSceneService} from "@/services/screenplay/SpSceneService.ts";
import {listSpRoleService} from "@/services/screenplay/SpRoleService.ts";
import {listSpDialogueService} from "@/services/screenplay/SpDialogueService.ts";

/**
 * 新增旁白
 */
export function openSpDialogueAddNarrator(
  screenplayId: string,
  sceneId: string,
  onUpdate: () => void) {
  const data = ref<SpDialogueCore>({
    screenplay_id: screenplayId,
    scene_id: sceneId,
    role_id: '',
    type: 'narrator',
    action: '',
    dialogue: '',
    director_instruction_id: ''
  });
  const useAiPolish = ref(false);
  const loading = ref(false);

  const dp = DialogPlugin({
    header: '推进剧情',
    onConfirm: async () => {
      if (!data.value.dialogue) {
        MessageUtil.error("请填写剧情内容");
        return;
      }
      
      if (useAiPolish.value) {
        loading.value = true;
        try {
          const [screenplay, scene, roles, dialogues] = await Promise.all([
            getScreenplayService(screenplayId),
            getSpSceneService(sceneId),
            listSpRoleService(screenplayId),
            listSpDialogueService(screenplayId, sceneId)
          ]);

          if (!screenplay || !scene) {
            MessageUtil.error("获取剧本或场景信息失败");
            loading.value = false;
            return;
          }

          const narrator = roles.find(r => r.type === 'narrator');
          if (!narrator) {
            MessageUtil.error("未找到叙述者 AI 角色");
            loading.value = false;
            return;
          }

          const roleMap = new Map(roles.map(r => [r.id, r]));
          const recentDialogues = dialogues.slice(-10);

          await askAiScreenplayNarrator({
            narrator,
            screenplay,
            scene,
            roles: roles.filter(r => r.type !== 'narrator'),
            dialogues: recentDialogues,
            roleMap,
            triggerReason: `用户推进剧情：${data.value.dialogue}`,
            task: 'polish_plot'
          });

          onUpdate();
          dp.destroy?.();
          MessageUtil.success("AI 润色并新增成功");
        } catch (e) {
          console.error("AI 润色失败:", e);
          MessageUtil.error("AI 润色失败，将使用原内容", e);
          addSpDialogueService(data.value).then(() => {
            onUpdate();
            dp.destroy?.();
            MessageUtil.success("新增成功");
          }).catch(e => {
            MessageUtil.error("新增失败", e);
          });
        } finally {
          loading.value = false;
        }
      } else {
        addSpDialogueService(data.value).then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success("新增成功");
        }).catch(e => {
          MessageUtil.error("新增失败", e);
        });
      }
    },
    default: () => (<Form>
      <FormItem label="剧情内容" labelAlign={'top'} name="dialogue">
        <Textarea v-model={data.value.dialogue} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
      <FormItem label="AI 润色" labelAlign={'top'} name="useAiPolish">
        <Checkbox v-model={useAiPolish.value} disabled={loading.value}>
          让叙述者 AI 润色剧情内容
        </Checkbox>
      </FormItem>
    </Form>)
  })
}