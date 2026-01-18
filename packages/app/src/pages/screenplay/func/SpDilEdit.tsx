import type {SpDilInstruction, SpDirectorInstructionLogCore} from "@/entity/screenplay";
import {DialogPlugin, Form, FormItem, Input, Select, Switch, Textarea} from "tdesign-vue-next";
import {addSpDilService, listSpRoleAppearanceService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {listSpRoleService} from "@/services/screenplay/SpRoleService.ts";
import {set} from "@/util";

const instructionOptions = [
  {label: '角色失言', value: 'character_slip'},
  {label: '物品发现', value: 'reveal_item'},
  {label: '外部事件', value: 'external_event'},
  {label: '跳过回合', value: 'skip_turn'},
  {label: '触发情绪', value: 'trigger_emotion'}
];

export async function openSpDirectorInstructionLog(
  screenplayId: string,
  sceneId: string,
  instruction: SpDilInstruction
) {
  const roles = await listSpRoleService(screenplayId, 'member');
  const app = await listSpRoleAppearanceService(screenplayId, sceneId);
  const hasRoleIds = set(app, 'role_id');
  const roleOptions = roles
    .map(r => ({label: r.name, value: r.id, disabled: !hasRoleIds.has(r.id)}));

  const params = ref<Record<string, any>>({});
  const data = ref<SpDirectorInstructionLogCore>({
    screenplay_id: screenplayId,
    scene_id: sceneId,
    instruction: instruction,
    params: '{}',
    is_active: 0
  });

  const dp = DialogPlugin({
    header: "导演指令",
    onConfirm() {
      data.value.params = JSON.stringify(params.value);
      addSpDilService(data.value)
        .then(() => {
          dp.destroy();
          MessageUtil.success("新增成功");
        })
        .catch(e => {
          MessageUtil.error("新增失败", e);
        });
    },
    default: () => {
      return <div>
        <Form labelWidth={120}>
          <FormItem label="指令类型" name="instruction">
            <Select value={instruction} disabled={true} options={instructionOptions}/>
          </FormItem>

          {instruction === 'character_slip' && (
            <>
              <FormItem label="目标角色" name="target_role_id">
                <Select
                  v-model={params.value.target_role_id}
                  options={roleOptions}
                  placeholder="请选择角色"
                />
              </FormItem>
              <FormItem label="失言内容" name="content">
                <Textarea
                  v-model={params.value.content}
                  autosize={{minRows: 3, maxRows: 6}}
                  placeholder="请输入角色失言的内容"
                />
              </FormItem>
            </>
          )}

          {instruction === 'reveal_item' && (
            <>
              <FormItem label="物品描述" name="item_desc">
                <Textarea
                  v-model={params.value.item_desc}
                  autosize={{minRows: 3, maxRows: 6}}
                  placeholder="请输入物品描述（如：口红盖有字）"
                />
              </FormItem>
              <FormItem label="发现者" name="discoverer_id">
                <Select
                  v-model={params.value.discoverer_id}
                  options={roleOptions}
                  placeholder="请选择发现者"
                />
              </FormItem>
            </>
          )}

          {instruction === 'external_event' && (
            <FormItem label="事件描述" name="description">
              <Textarea
                v-model={params.value.description}
                autosize={{minRows: 3, maxRows: 6}}
                placeholder="请输入外部事件描述（如：警笛、停电、敲门）"
              />
            </FormItem>
          )}

          {instruction === 'skip_turn' && (
            <FormItem label="跳过角色" name="role_id">
              <Select
                v-model={params.value.role_id}
                options={roleOptions}
                placeholder="请选择要跳过的角色"
              />
            </FormItem>
          )}

          {instruction === 'trigger_emotion' && (
            <>
              <FormItem label="目标角色" name="role_id">
                <Select
                  v-model={params.value.role_id}
                  options={roleOptions}
                  placeholder="请选择角色"
                />
              </FormItem>
              <FormItem label="情绪类型" name="emotion">
                <Input
                  v-model={params.value.emotion}
                  placeholder="请输入情绪类型（如：愤怒、悲伤）"
                />
              </FormItem>
              <FormItem label="情绪变化值" name="delta">
                <Input
                  v-model={params.value.delta}
                  type="number"
                  placeholder="请输入情绪变化值（如：+30、-20）"
                />
              </FormItem>
            </>
          )}

          <FormItem label="是否生效" name="is_active">
            <Switch v-model={data.value.is_active} customValue={[1, 0]}/>
          </FormItem>
        </Form>
      </div>
    }
  })
}