import type {AiRtParticipantCore} from "@/entity/app/ai/roundtable";
import {cloneDeep} from "es-toolkit";
import {
  Form,
  FormItem,
  Tag,
  Textarea,
  Collapse,
  CollapsePanel,
  InputNumber,
  Slider,
  Select, Input, Switch, DrawerPlugin,
} from "tdesign-vue-next";
import "./participant-config.less"
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

export function openParticipantConfig(
  participant: AiRtParticipantCore,
  onUpdate: (res: AiRtParticipantCore) => void,
  presets: boolean
) {
  const data = ref(cloneDeep(participant));
  const advancedExpanded = ref([]);
  const options = computed(() => useSettingStore().modelOptions);
  const dp = DrawerPlugin({
    header: () => (<div class="config-header">
      <div class="config-role-info">
        <h4 class="config-role-name">{data.value.name}</h4>
        <Tag size="small" theme={data.value.type === 'admin' ? 'warning' : 'default'}>
          {data.value.type === 'admin' ? '管理员' : '参与者'}
        </Tag>
      </div>
    </div>),
    size: '700px',
    default: () => (<div class="participant-config">
      {presets && <div class="config-section">
        <div class="config-label">角色提示词</div>
        <div class="config-prompt">{data.value.prompt || '暂无提示词'}</div>
      </div>}
      <Form>
        {!presets && <FormItem labelAlign="top" label="角色名称" class="config-form-item">
          <Input v-model={data.value.name}/>
        </FormItem>}
        {!presets && <FormItem labelAlign="top" label="角色提示词" class="config-form-item">
          <Textarea v-model={data.value.scene_prompt} placeholder="请输入场景提示词，描述具体的身份信息/行为信息"
                    autosize={{minRows: 3, maxRows: 6}}/>
        </FormItem>}
        <FormItem labelAlign="top" label="场景提示词" class="config-form-item">
          <Textarea v-model={data.value.scene_prompt} placeholder="请输入场景提示词，描述具体的身份信息/行为信息"
                    autosize={{minRows: 3, maxRows: 6}}/>
        </FormItem>
        <FormItem labelAlign="top" label="立场" class="config-form-item">
          <Textarea v-model={data.value.stance} placeholder="请输入该参与者的立场观点"
                    autosize={{minRows: 2, maxRows: 4}}/>
        </FormItem>
      </Form>
      <Collapse v-model={advancedExpanded.value} class="!mt-20px">
        <CollapsePanel header="高级参数" value="advanced">
          <Form labelAlign="top">
            <FormItem label="角色名称">
              <Input v-model={data.value.name} clearable={true}/>
            </FormItem>
            <FormItem label="使用的模型">
              <Select v-model={data.value.model} options={options.value} filterable={true} clearable={true}/>
            </FormItem>
            <FormItem label="最小响应字数">
              <InputNumber v-model={data.value.min_response_length} min={-1}/>
            </FormItem>
            <FormItem label="最大响应字数">
              <InputNumber v-model={data.value.max_response_length} min={-1}/>
            </FormItem>
            <FormItem label="生成随机性">
              <Slider v-model={data.value.temperature} min={0} max={1} step={0.1} marks={{0: '0', 0.5: '0.5', 1: '1'}}/>
            </FormItem>
            <FormItem label="最大思考时间（秒）">
              <InputNumber v-model={data.value.timeout_per_turn} min={1}/>
            </FormItem>
            <FormItem label="启用事实核查">
              <Switch v-model={data.value.enable_fact_checking} customValue={[0, 1]}/>
            </FormItem>
            <FormItem label="允许主动@他人">
              <Switch v-model={data.value.allow_cross_talk} customValue={[0, 1]}/>
            </FormItem>
          </Form>
        </CollapsePanel>
      </Collapse>
    </div>),
    onConfirm: () => {
      onUpdate(data.value);
      dp.destroy?.();
    }
  })
}