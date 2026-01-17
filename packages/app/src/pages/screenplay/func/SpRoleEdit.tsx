import {DrawerPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import type {SpRoleCore} from "@/entity/screenplay";
import {addSpRoleService, deleteSpRoleService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openSpRoleAdd(screenplayId: string, onUpdate: () => void) {
  const data = ref<SpRoleCore>({
    screenplay_id: screenplayId,
    name: '',
    identity: '',
    secret_info: '',
    personality: '',
    in_narrator: 0
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
      <FormItem labelAlign="top" label="公开身份" class="config-form-item">
        <Textarea autosize={{minRows: 3,maxRows: 10}} v-model={data.value.identity}/>
      </FormItem>
      <FormItem labelAlign="top" label="私有信息" help={'初始秘密，仅该角色知道'} class="config-form-item">
        <Textarea autosize={{minRows: 3,maxRows: 10}} v-model={data.value.secret_info}/>
      </FormItem>
      <FormItem labelAlign="top" label="性格描述" help={'角色性格，影响角色的回复'} class="config-form-item">
        <Textarea autosize={{minRows: 3,maxRows: 10}} v-model={data.value.personality}/>
      </FormItem>
    </Form>)
  })
}


export function openSpNarratorRoleAdd(screenplayId: string, onUpdate: () => void) {
  const data = ref<SpRoleCore>({
    screenplay_id: screenplayId,
    name: '旁白',
    identity: '旁白',
    secret_info: '',
    personality: '',
    in_narrator: 1
  })
  const dp = DrawerPlugin({
    header: "新增旁白角色",
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
      <FormItem labelAlign="top" label="提示词" help={'影响旁白生成风格'} class="config-form-item">
        <Textarea autosize={{minRows: 3,maxRows: 10}} v-model={data.value.personality}/>
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