import {DialogPlugin, Form, FormItem, Input, InputNumber, Radio, RadioGroup} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {buildNetworkServerEdit, type NetworkServer, type NetworkServerEdit} from "@/entity/NetworkServer.ts";
import {useNetworkServerStore} from "@/store/NetworkServerStore.ts";

export function openNetworkServerEdit(old?: NetworkServer) {

  const server = ref<NetworkServerEdit>(old || buildNetworkServerEdit());
  const update = !!old;


  const plugin = DialogPlugin({
    header: (update ? "修改" : "新增") + "网络服务器",
    confirmBtn: update ? "修改" : "新增",
    placement: "center",
    default: () => <Form data={server.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={server.value.name} clearable/>
      </FormItem>
      <FormItem label={'分组'} labelAlign={"top"}>
        <Input v-model={server.value.group} clearable/>
      </FormItem>
      <FormItem label={'排序'} labelAlign={"top"} help={"越小越靠前"}>
        <InputNumber v-model={server.value.sequence}/>
      </FormItem>
      <FormItem label={'类型'} labelAlign={"top"}>
        <RadioGroup v-model={server.value.type}>
          <Radio value={'CMS:JSON'} label={'CMS:JSON'}>CMS:JSON</Radio>
          <Radio value={'CMS:XML'} label={'CMS:XML'}>CMS:XML</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label={'地址'} labelAlign={"top"}>
        <Input v-model={server.value.url} clearable/>
      </FormItem>
      <FormItem label={'m3u8解析地址'} labelAlign={"top"}>
        <Input v-model={server.value.m3u8Parse} clearable/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      (old ? useNetworkServerStore().updateServer(server.value, old.id) : useNetworkServerStore().addServer(server.value))
        .then(() => {
          MessageUtil.success(update ? "修改媒体服务器成功" : "新增媒体服务器成功");
          plugin.destroy();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })

}