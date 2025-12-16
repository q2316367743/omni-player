import {buildMediaServerInsert, type MediaServer, type MediaServerEdit} from "@/entity/MediaServer.ts";
import {DialogPlugin, Form, FormItem, Input, Radio, RadioGroup} from "tdesign-vue-next";
import {useStronghold} from "@/lib/Stronghold.ts";
import {useMediaServerStore} from "@/store";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function openMediaServerEdit(old?: MediaServer) {

  const server = ref<MediaServerEdit>({
    ...(old || buildMediaServerInsert()),
    username: '',
    password: ''
  })
  const update = !!old;


  if (old) {
    (async () => {
      server.value.username = await useStronghold().getMediaRecord(old.id, "username") || '';
      server.value.password = await useStronghold().getMediaRecord(old.id, "password") || '';
    })().catch(e => MessageUtil.error("初始化密码信息失败", e))
  }

  const plugin = DialogPlugin({
    header: (update ? "修改" : "新增") + "媒体服务器",
    confirmBtn: update ? "修改" : "新增",
    placement: "center",
    default: () => <Form data={server.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={server.value.name} clearable/>
      </FormItem>
      <FormItem label={'类型'} labelAlign={"top"}>
        <RadioGroup v-model={server.value.type}>
          <Radio value={'jellyfin'} label={'Jellyfin'}>Jellyfin</Radio>
          <Radio value={'emby'} label={'Emby'}>Emby</Radio>
          <Radio value={'plex'} label={'Plex'}>Plex</Radio>
        </RadioGroup>
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
      (old ? useMediaServerStore().updateServer(server.value, old.id) : useMediaServerStore().addServer(server.value))
        .then(() => {
          MessageUtil.success(update ? "修改媒体服务器成功" : "新增媒体服务器成功");
          plugin.destroy();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })

}