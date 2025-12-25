import {DrawerPlugin, Form, FormItem, Input, InputNumber, Radio, RadioGroup} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {
  buildNetworkServerEdit,
  type NetworkServer,
  type NetworkServerEdit,
  NetworkServerTypeOptions
} from "@/entity/NetworkServer.ts";
import {useNetworkServerStore} from "@/store/NetworkServerStore.ts";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openNetworkServerEdit(old?: NetworkServer) {

  const server = ref<NetworkServerEdit>(old || buildNetworkServerEdit());
  const update = !!old;


  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "网络服务器",
    confirmBtn: update ? "修改" : "新增",
    size: "600px",
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
        <RadioGroup v-model={server.value.type} options={NetworkServerTypeOptions}/>
      </FormItem>
      <FormItem label={'格式'} labelAlign={"top"}>
        <RadioGroup v-model={server.value.format}>
          <Radio value={'json'} label={'JSON'}>JSON</Radio>
          <Radio value={'xml'} label={'XML'}>XML</Radio>
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
          plugin.destroy?.();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })

}


export function openNetworkContextmenu(server: NetworkServer, e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "修改",
        icon: () => <EditIcon/>,
        onClick: () => {
          openNetworkServerEdit(server);
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "提示", {
            confirmButtonText: "确定",
          }).then(() => {
            useNetworkServerStore().removeServer(server)
              .then(() => MessageUtil.success("删除成功"))
              .catch((e) => MessageUtil.error("删除失败", e))
          })
        }
      }
    ]
  })

}