import {DrawerPlugin, Form, FormItem, Input, Option, Select, Textarea} from "tdesign-vue-next";
import {addSpChapterService, type SpChapterAdd} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil";

export function openSpChapterAdd(screenplayId: string, onUpdate: () => void) {
  const data = ref<SpChapterAdd>({
    title: '',
    description: '',
    screenplay_id: screenplayId,
    name: '',
    narrative_goal: '',
    key_clues: '[]',
    required_revelations: '[]',
    termination_strategy: 'goal_driven'
  })
  const dp = DrawerPlugin({
    header: '添加章节',
    size: "800px",
    onConfirm() {
      if (!data.value.title) {
        MessageUtil.error("请填写章节名称");
        return;
      }
      if (!data.value.description) {
        MessageUtil.error("请填写章节描述");
        return;
      }
      addSpChapterService(data.value)
        .then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success("添加成功");
        })
        .catch(e => {
          MessageUtil.error("添加失败", e);
        })
    },
    default: () => (<Form data={data.value}>
      <FormItem label="章节名称" name="name" labelAlign="top">
        <Input v-model={data.value.title} placeholder="请输入章节名称"/>
      </FormItem>
      <FormItem label="章节描述" name="description" labelAlign="top">
        <Textarea v-model={data.value.description} placeholder="请输入章节描述" autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
      <FormItem labelAlign={'top'} label={'终止策略'}>
        <Select v-model={data.value.termination_strategy}>
          <Option value="goal_driven" label="目标达成即结束"/>
          <Option value="tension_peak" label="情绪峰值后结束"/>
          <Option value="external_event" label="等待外部事件"/>
          <Option value="manual" label="手动控制"/>
        </Select>
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