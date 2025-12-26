import {DrawerPlugin, Form, FormItem, Input, InputNumber} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {buildSubscribeItemEdit, type SubscribeItem, type SubscribeItemEdit} from "@/entity/subscribe";
import {addSubscribe, removeSubscribe, updateSubscribe} from "@/services";
import {cloneDeep} from "es-toolkit";

export function openSubscribeEdit(onUpdate: () => void, old?: SubscribeItem) {

  const server = ref<SubscribeItemEdit>(old ? cloneDeep(old) : buildSubscribeItemEdit());
  const update = !!old;


  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "订阅项",
    confirmBtn: update ? "修改" : "新增",
    size: "600px",
    default: () => <Form data={server.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={server.value.name} clearable/>
      </FormItem>
      <FormItem label={'文件夹'} labelAlign={"top"}>
        <Input v-model={server.value.folder} clearable/>
      </FormItem>
      <FormItem label={' 链接'} labelAlign={"top"}>
        <Input v-model={server.value.url} clearable/>
      </FormItem>
      <FormItem label={'排序'} labelAlign={"top"} help={"越小越靠前"}>
        <InputNumber v-model={server.value.sequence}/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      (old ? updateSubscribe(old.id, server.value) : addSubscribe(server.value))
        .then(() => {
          MessageUtil.success(update ? "修改订阅项成功" : "新增订阅项成功");
          plugin.destroy?.();
          onUpdate();
        }).catch(e => {
        console.error(e);
        MessageUtil.error("操作失败", e)
      });
    }
  })

}


export function openSubscribeContextmenu(onUpdate: () => void, server: SubscribeItem, e: PointerEvent) {
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
          openSubscribeEdit(onUpdate, server);
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "提示", {
            confirmButtonText: "确定",
          }).then(() => {
            removeSubscribe(server.id)
              .then(() => {
                MessageUtil.success("删除成功");
                onUpdate();
              })
              .catch((e) => MessageUtil.error("删除失败", e))
          })
        }
      }
    ]
  })

}