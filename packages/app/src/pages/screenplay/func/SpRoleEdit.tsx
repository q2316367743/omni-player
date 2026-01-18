import {DrawerPlugin, Form, FormItem, Input, Select, Textarea} from "tdesign-vue-next";
import type {SpRole, SpRoleCore} from "@/entity/screenplay";
import {addSpRoleService, deleteSpRoleService, updateSpRoleService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {cloneDeep} from "es-toolkit";

export function openSpRoleAdd(screenplayId: string, onUpdate: () => void) {
  const {defaultChatModel, modelOptions} = useSettingStore();
  const data = ref<SpRoleCore>({
    screenplay_id: screenplayId,
    name: '',
    identity: '',
    secret_info: '',
    personality: '',
    type: 'member',
    model: defaultChatModel
  })
  const dp = DrawerPlugin({
    header: "新增角色",
    size: "800px",
    onConfirm() {
      addSpRoleService(data.value).then(() => {
        onUpdate();
        dp.destroy?.();
        MessageUtil.success("新增成功");
      })
        .catch(e => {
          MessageUtil.error("新增失败", e);
        })
    },
    default: () => (<Form>
      <FormItem labelAlign="top" label="角色名称" class="config-form-item">
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem labelAlign="top" label="角色模型" class="config-form-item">
        <Select v-model={data.value.model} options={modelOptions} filterable={true}/>
      </FormItem>
      <FormItem labelAlign="top" label="公开身份" class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.identity}/>
      </FormItem>
      <FormItem labelAlign="top" label="私有信息" help={'初始秘密，仅该角色知道'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.secret_info}/>
      </FormItem>
      <FormItem labelAlign="top" label="性格描述" help={'角色性格，影响角色的回复'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.personality}/>
      </FormItem>
    </Form>)
  })
}

export function openSpNarratorRoleAdd(screenplayId: string, onUpdate: () => void, old?: SpRole) {
  const {defaultChatModel, modelOptions} = useSettingStore();
  const data = ref<SpRoleCore>(old ? cloneDeep(old) : {
    screenplay_id: screenplayId,
    name: '旁白',
    identity: '旁白',
    secret_info: '',
    personality: '你是一位擅长悬疑小说的叙述者。请根据以下信息，生成一段50～120字的文学化旁白：\n' +
      '\n' +
      '- 使用具象动词和感官描写（视觉/听觉/触觉）\n' +
      '- 暗示情绪，但不说破（如用“喉结滚动”代替“他紧张”）\n' +
      '- 若提到物品，强调其象征性或异常细节\n' +
      '- 保持语气温冷、克制，带一丝压迫感\n' +
      '- 绝不泄露角色私有秘密（如未公开的谎言、身份）',
    type: 'narrator',
    model: defaultChatModel
  });
  const op = old ? '修改' : '新增';
  const dp = DrawerPlugin({
    header: op + "叙述者",
    confirmBtn: op,
    size: "800px",
    onConfirm() {
      (old ? updateSpRoleService(old.id, data.value) : addSpRoleService(data.value))
        .then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success(op + "成功");
        })
        .catch(e => {
          MessageUtil.error(op + "新增失败", e);
        })
    },
    default: () => (<Form>
      <FormItem labelAlign="top" label="模型" class="config-form-item">
        <Select v-model={data.value.model} options={modelOptions} filterable={true}/>
      </FormItem>
      <FormItem labelAlign="top" label="提示词" help={'影响旁白生成风格'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.personality}/>
      </FormItem>
    </Form>)
  })
}


export function openSpDecisionRoleAdd(screenplayId: string, onUpdate: () => void, old?: SpRole) {
  const {defaultChatModel, modelOptions} = useSettingStore();
  const data = ref<SpRoleCore>(old ? cloneDeep(old) : {
    screenplay_id: screenplayId,
    name: '决策者',
    identity: '决策者',
    secret_info: '',
    personality: '',
    type: 'decision',
    model: defaultChatModel
  });
  const op = old ? '修改' : '新增';
  const dp = DrawerPlugin({
    header: op + "决策者",
    confirmBtn: op,
    size: "800px",
    onConfirm() {
      (old ? updateSpRoleService(old.id, data.value) : addSpRoleService(data.value))
        .then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success(op + "成功");
        })
        .catch(e => {
          MessageUtil.error(op + "新增失败", e);
        })
    },
    default: () => (<Form>
      <FormItem labelAlign="top" label="模型" class="config-form-item">
        <Select v-model={data.value.model} options={modelOptions} filterable={true}/>
      </FormItem>
      <FormItem labelAlign="top" label="提示词" help={'影响故事发展的走向'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.personality}/>
      </FormItem>
    </Form>)
  })
}

export function openSpRoleDelete(roleId: string, onUpdate: () => void) {
  // TODO: 此处要校验，该角色是否已经发生过对话
  MessageBoxUtil.confirm("是否删除此角色？", "删除角色")
    .then(() => {
      deleteSpRoleService(roleId).then(() => {
        onUpdate();
        MessageUtil.success("删除成功");
      })
        .catch(e => {
          MessageUtil.error("删除失败", e);
        })
    })
}