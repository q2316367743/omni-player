import type {SpSceneCore} from "@/entity/screenplay";
import {DrawerPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import {addSpSceneService, deleteSpSceneService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openSpSceneAdd(screenplayId: string, onUpdate: () => void) {
  const data = ref<SpSceneCore>({
    screenplay_id: screenplayId,
    name: '',
    description: '',
  });
  const dp = DrawerPlugin({
    header: "新增场景",
    size: "800px",
    onConfirm() {
      if (!data.value.name) {
        MessageUtil.error("请填写场景名称");
        return;
      }
      if (!data.value.description) {
        MessageUtil.error("请填写场景描述");
        return;
      }
      addSpSceneService(data.value).then(() => {
        onUpdate();
        dp.destroy?.();
        MessageUtil.success("新增成功");
      })
        .catch(e => {
          MessageUtil.error("新增失败", e);
        })
    },
    default: () => (<Form>
      <FormItem labelAlign="top" label="场景名称" help={'如“市政厅会议室”'} class="config-form-item">
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem labelAlign="top" label="场景描述" help={'时间/天气/氛围'} class="config-form-item">
        <Textarea autosize={{minRows: 3,maxRows: 10}} v-model={data.value.description}/>
      </FormItem>
    </Form>)
  })
}


export function openSpSceneDelete(sceneId: string, onUpdate: () => void) {
  // TODO: 此处要校验，只能删除过去的，并且没有发生故事的场景
  MessageBoxUtil.confirm("是否删除此场景？", "删除场景")
    .then(() => {
      deleteSpSceneService(sceneId).then(() => {
        onUpdate();
        MessageUtil.success("删除成功");
      })
        .catch(e => {
          MessageUtil.error("删除失败", e);
        })
    })
}