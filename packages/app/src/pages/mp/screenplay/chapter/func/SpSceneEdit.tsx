import type {SpSceneCore} from "@/entity/screenplay";
import {DrawerPlugin, Form, FormItem, Input, Option, Select, Textarea} from "tdesign-vue-next";
import {addSpSceneService, deleteSpSceneService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openSpSceneAdd(screenplayId: string, chapterId: string, onUpdate: () => void) {
  const data = ref<SpSceneCore>({
    screenplay_id: screenplayId,
    chapter_id: chapterId,
    name: '',
    description: '',
    narrative_goal: '',
    key_clues: '[]',
    required_revelations: '[]',
    termination_strategy: 'goal_driven'
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
      <FormItem labelAlign={'top'} label={'终止策略'}>
        <Select v-model={data.value.termination_strategy}>
          <Option value="goal_driven" label="目标达成即结束"/>
          <Option value="tension_peak" label="情绪峰值后结束"/>
          <Option value="external_event" label="等待外部事件"/>
          <Option value="manual" label="手动控制"/>
        </Select>
      </FormItem>
      <FormItem labelAlign="top" label="场景描述" help={'时间/天气/氛围'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.description}/>
      </FormItem>
      <FormItem labelAlign="top" label="本场景必须达成的叙事目标"
                help={'example: 揭示林美如死前曾向至少一人透露过‘稿子’的存在'}
                class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.narrative_goal}/>
      </FormItem>
      <FormItem labelAlign="top" label="必须在此场景揭露的关键线索（JSON 数组）"
                help={'example: ["镜面字迹色号=琴子口红", "小红书无口红视频", "陌生香水味"]'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.key_clues}/>
      </FormItem>
      <FormItem labelAlign="top" label="必须发生的角色坦白/冲突（JSON 数组）"
                help={'example: ["琴子承认知道稿子", "西西暴露与林美如的争执"]'} class="config-form-item">
        <Textarea autosize={{minRows: 3, maxRows: 10}} v-model={data.value.required_revelations}/>
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