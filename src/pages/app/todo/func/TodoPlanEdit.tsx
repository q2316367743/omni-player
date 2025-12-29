import {DrawerPlugin, Form, FormItem, Input, Radio, RadioGroup} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {TodoPlan} from "@/entity/todo/TodoPlan.ts";

export interface TodoPlanEdit {
  name: string;
  folder: boolean;
  parentId: string;
}

export function openTodoPlanEdit(old?: TodoPlan, parentId?: string, onConfirm?: (data: TodoPlanEdit) => Promise<void> | void) {
  const plan = ref<TodoPlanEdit>({
    name: old?.name || '',
    folder: old?.folder || false,
    parentId: old?.parentId || parentId || ''
  });
  const update = !!old;

  const plugin = DrawerPlugin({
    header: (update ? "修改" : "新增") + "待办计划",
    confirmBtn: update ? "修改" : "新增",
    size: "500px",
    default: () => <Form data={plan.value}>
      <FormItem label={'名称'} labelAlign={"top"}>
        <Input v-model={plan.value.name} clearable placeholder="请输入计划名称"/>
      </FormItem>
      <FormItem label={'类型'} labelAlign={"top"}>
        <RadioGroup v-model={plan.value.folder}>
          <Radio value={false} label={'plan'}>计划</Radio>
          <Radio value={true} label={'folder'}>文件夹</Radio>
        </RadioGroup>
      </FormItem>
    </Form>,
    onConfirm: async () => {
      if (!plan.value.name) {
        MessageUtil.warning("请输入计划名称");
        return;
      }
      if (onConfirm) {
        await onConfirm(plan.value);
      }
      plugin.destroy?.();
    }
  });
}
