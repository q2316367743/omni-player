import {DrawerPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {TodoGroup} from "@/entity/todo/TodoGroup.ts";

export interface TodoGroupEdit {
  name: string;
}

export function openTodoGroupEdit(old?: TodoGroup, onConfirm?: (data: TodoGroupEdit) => Promise<void> | void) {
  const group = ref<TodoGroupEdit>({
    name: old?.name || ''
  });
  const update = !!old;

  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "待办分组",
    confirmBtn: update ? "修改" : "新增",
    size: "400px",
    default: () => <Form data={group.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={group.value.name} clearable placeholder="请输入分组名称"/>
      </FormItem>
    </Form>,
    onConfirm: async () => {
      if (!group.value.name) {
        MessageUtil.warning("请输入分组名称");
        return;
      }
      if (onConfirm) {
        await onConfirm(group.value);
      }
      plugin.destroy?.();
    }
  });
}
