import {DrawerPlugin, Form, FormItem, Input, TagInput} from "tdesign-vue-next";
import {addSnippet, type SnippetMetaWithTag, setSnippetTag, type Snippet} from "@/services/SnippetService";
import MessageUtil from "@/util/model/MessageUtil";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import {renameSnippetContent, deleteSnippet} from "@/services/SnippetService";

export function openSnippetEdit(old?: SnippetMetaWithTag, onSuccess?: () => void) {
  const name = ref(old?.name || '');
  const update = !!old;

  const plugin = DrawerPlugin({
    header: (update ? "重命名" : "新增") + "代码片段",
    confirmBtn: update ? "确定" : "新增",
    size: "400px",
    default: () => <Form data={{name}}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={name.value} clearable placeholder="请输入代码片段名称"/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      if (!name.value.trim()) {
        MessageUtil.warning("请输入代码片段名称");
        return;
      }
      
      (old ? renameSnippetContent(old.id, name.value) : addSnippet(name.value))
        .then(() => {
          MessageUtil.success(update ? "重命名成功" : "新增成功");
          plugin.destroy?.();
          onSuccess?.();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })
}

export function openTagEdit(snippet: Snippet, onSuccess?: () => void) {
  const tags = ref(snippet.tags.map(tag => tag.name));

  const plugin = DrawerPlugin({
    header: "编辑标签",
    confirmBtn: "确定",
    size: "400px",
    default: () => <Form data={{tags}}>
      <FormItem label={'标签'} labelAlign={"top"}>
        <TagInput v-model={tags.value} clearable placeholder="多个标签用逗号分隔"/>
      </FormItem>
    </Form>,
    onConfirm: () => {
      setSnippetTag(snippet.id, tags.value)
        .then(() => {
          MessageUtil.success("标签设置成功");
          plugin.destroy?.();
          onSuccess?.();
        }).catch(e => MessageUtil.error("操作失败", e));
    }
  })
}

export function openSnippetContextmenu(snippet: SnippetMetaWithTag, e: PointerEvent, onSuccess?: () => void) {
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
          openSnippetEdit(snippet, onSuccess);
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除这个代码片段吗？", "提示", {
            confirmButtonText: "确定",
          }).then(() => {
            deleteSnippet(snippet.id)
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
  })
}
