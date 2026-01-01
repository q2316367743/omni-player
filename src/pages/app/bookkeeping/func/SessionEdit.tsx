import {DrawerPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import type {AnalysisSession} from "@/entity/analysis/AnalysisSession.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";

export async function updateAnalysisSession(id: string, filename: string) {
  const sql = useSql();
  const mapper = await sql.mapper<AnalysisSession>('analysis_session');
  await mapper.updateById(id, { filename });
}

export async function deleteAnalysisSession(id: string) {
  const sql = useSql();
  const mapper = await sql.mapper<AnalysisSession>('analysis_session');
  await mapper.deleteById(id);
}

export function openSessionRename(session: AnalysisSession, onSuccess?: () => void) {
  const filename = ref(session.filename);

  const plugin = DrawerPlugin({
    header: "重命名账单",
    confirmBtn: "确定",
    size: "400px",
    default: () => <Form data={{filename: filename.value}}>
      <FormItem label={'文件名'} labelAlign={"top"}>
        <Input v-model={filename.value} clearable/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      updateAnalysisSession(session.id, filename.value)
        .then(() => {
          MessageUtil.success("重命名成功");
          plugin.destroy?.();
          onSuccess?.();
        }).catch(e => MessageUtil.error("重命名失败", e));
    }
  });
}

export function openSessionContextmenu(session: AnalysisSession, e: PointerEvent, onSuccess?: () => void) {
  e.preventDefault();
  e.stopPropagation();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "重命名",
        icon: () => <EditIcon/>,
        onClick: () => {
          openSessionRename(session, onSuccess);
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除此账单吗？删除后将无法恢复。", "提示", {
            confirmButtonText: "确定",
          }).then(() => {
            deleteAnalysisSession(session.id)
              .then(() => {
                MessageUtil.success("删除成功");
                onSuccess?.();
              })
              .catch((e) => MessageUtil.error("删除失败", e))
          }).catch(() => {
            console.log('删除已取消');
          });
        }
      }
    ]
  });
}
