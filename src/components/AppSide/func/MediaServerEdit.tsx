import {buildMediaServerInsert, type MediaServer, type MediaServerEdit} from "@/entity/MediaServer.ts";
import {DrawerPlugin, Form, FormItem, Input, InputNumber, Radio, RadioGroup} from "tdesign-vue-next";
import {useMediaStronghold} from "@/lib/Stronghold.ts";
import {useMediaServerStore} from "@/store";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";

export function openMediaServerEdit(old?: MediaServer) {

  const server = ref<MediaServerEdit>({
    ...(old || buildMediaServerInsert()),
    username: '',
    password: ''
  })
  const update = !!old;


  if (old) {
    (async () => {
      server.value.username = await useMediaStronghold().getMediaRecord(old.id, "username") || '';
      server.value.password = await useMediaStronghold().getMediaRecord(old.id, "password") || '';
    })().catch(e => MessageUtil.error("初始化密码信息失败", e))
  }

  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "媒体服务器",
    confirmBtn: update ? "修改" : "新增",
    size: "600px",
    default: () => <Form data={server.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={server.value.name} clearable/>
      </FormItem>
      <FormItem label={'排序'} labelAlign={"top"} help={"越小越靠前"}>
        <InputNumber v-model={server.value.sequence}/>
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
          plugin.destroy?.();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })

}

export function openMediaContextmenu(server: MediaServer, e: PointerEvent) {
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
          openMediaServerEdit(server);
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "提示", {
            confirmButtonText: "确定",
          }).then(() => {
            useMediaServerStore().removeServer(server)
              .then(() => MessageUtil.success("删除成功"))
              .catch((e) => MessageUtil.error("删除失败", e))
          })
        }
      }
    ]
  })

}