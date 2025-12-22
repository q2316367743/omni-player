import {DrawerPlugin, Form, FormItem, Input, RadioGroup} from "tdesign-vue-next";
import {buildFileServerEdit, type FileServer, type FileServerEdit, FileServerTypeOptions} from "@/entity/FileServer.ts";
import {useFileStronghold} from "@/lib/Stronghold.ts";
import {useFileServerStore} from "@/store";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function openFileServerEdit(old?: FileServer) {

  const server = ref<FileServerEdit>({
    ...buildFileServerEdit(),
    ...(old || {}),
  });
  const update = !!old;

  if (old) {
    (async () => {
      server.value.username = await useFileStronghold().getFileRecord(old.id, "username") || '';
      server.value.password = await useFileStronghold().getFileRecord(old.id, "password") || '';
    })().catch((e: unknown) => MessageUtil.error("初始化密码信息失败", e))
  }

  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "文件服务器",
    confirmBtn: update ? "修改" : "新增",
    size: "600px",
    attach: ".app-layout-content",
    default: () => <Form data={server.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={server.value.name} clearable/>
      </FormItem>
      <FormItem label={'类型'} labelAlign={"top"}>
        <RadioGroup v-model={server.value.type} options={FileServerTypeOptions}/>
      </FormItem>
      <FormItem label={'地址'} labelAlign={"top"}>
        <Input v-model={server.value.url} clearable/>
      </FormItem>
      <FormItem label={'用户名'} labelAlign={"top"}>
        <Input v-model={server.value.username} clearable/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={"top"}>
        <Input v-model={server.value.password} clearable type={"password"}/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      (old ? useFileServerStore().updateServer(server.value, old.id) : useFileServerStore().addServer(server.value))
        .then(() => {
          MessageUtil.success(update ? "修改文件服务器成功" : "新增文件服务器成功");
          plugin.destroy?.();
        }).catch((e: unknown) => MessageUtil.error("操作失败", e));
    }
  })

}
