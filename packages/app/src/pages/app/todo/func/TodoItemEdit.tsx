import {DrawerPlugin, Form, FormItem, Input, Radio, RadioGroup, Textarea} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {TodoItem} from "@/entity/todo/TodoItem.ts";
import type {TodoItemPriority, TodoItemStatus} from "@/entity/todo/TodoItem.ts";

export interface TodoItemEdit {
  title: string;
  desc: string;
  priority: TodoItemPriority;
  status: TodoItemStatus;
  tags: string;
}

export function openTodoItemEdit(old?: TodoItem, onConfirm?: (data: TodoItemEdit) => Promise<void> | void) {
  const item = ref<TodoItemEdit>({
    title: old?.title || '',
    desc: old?.desc || '',
    priority: old?.priority || 4,
    status: old?.status ?? 0,
    tags: old?.tags || ''
  });
  const update = !!old;

  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "待办项",
    confirmBtn: update ? "修改" : "新增",
    size: "600px",
    default: () => <Form data={item.value}>
      <FormItem label={'标题'} labelAlign={"top"}>
        <Input v-model={item.value.title} clearable placeholder="请输入待办标题"/>
      </FormItem>
      <FormItem label={'描述'} labelAlign={"top"}>
        <Textarea 
          v-model={item.value.desc} 
          placeholder="请输入待办描述"
          autosize={{ minRows: 3, maxRows: 6 }}
        />
      </FormItem>
      <FormItem label={'优先级'} labelAlign={"top"}>
        <RadioGroup v-model={item.value.priority}>
          <Radio value={1} label={'high'}>高</Radio>
          <Radio value={2} label={'medium'}>中</Radio>
          <Radio value={3} label={'low'}>低</Radio>
          <Radio value={4} label={'none'}>无</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label={'状态'} labelAlign={"top"}>
        <RadioGroup v-model={item.value.status}>
          <Radio value={0} label={'todo'}>待办</Radio>
          <Radio value={1} label={'done'}>已完成</Radio>
          <Radio value={2} label={'cancelled'}>已取消</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label={'标签'} labelAlign={"top"} help="多个标签用逗号分隔">
        <Input v-model={item.value.tags} clearable placeholder="例如: 工作, 重要, 紧急"/>
      </FormItem>
    </Form>,
    onConfirm: async () => {
      if (!item.value.title) {
        MessageUtil.warning("请输入待办标题");
        return;
      }
      if (onConfirm) {
        await onConfirm(item.value);
      }
      plugin.destroy?.();
    }
  });
}
