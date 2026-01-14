import {
  type AiRtRole,
  type AiRtRoleAdd,
  type AiRtRoleType,
  type AiRtRoleUpdate,
  buildAiRtRoleAdd
} from "@/entity/app/ai/roundtable";
import {DrawerPlugin, Form, FormItem, Input, InputNumber, Radio, RadioGroup, Select, Textarea} from "tdesign-vue-next";
import {addAiRtRoleService, deleteAiRtRoleService, updateAiRtRoleService} from "@/services/app/roundtable";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Cxt from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {cloneDeep} from "es-toolkit";

export function openRoundtableRoleAdd(type: AiRtRoleType, onUpdate: () => void) {
  const data = ref<AiRtRoleAdd>(buildAiRtRoleAdd(type));
  const options = computed(() => useSettingStore().modelOptions);

  const dp = DrawerPlugin({
    header: `新增${type === 'admin' ? '上帝' : '普通'}角色`,
    confirmBtn: '新增',
    size: "800px",
    onConfirm: async () => {
      addAiRtRoleService(data.value)
        .then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success("新增成功");
        })
        .catch(e => {
          MessageUtil.error("新增失败", e);
        })
    },
    default: () => (<Form data={data.value}>
      <FormItem label="角色名称" labelAlign={'top'} name="name">
        <Input v-model={data.value.name} placeholder="请输入角色名称"/>
      </FormItem>
      <FormItem label="提示词" labelAlign={'top'} name="prompt">
        <Textarea v-model={data.value.prompt} placeholder="请输入提示词" autosize={{ minRows: 3, maxRows: 6 }}/>
      </FormItem>
      <FormItem label="使用的模型" labelAlign={'top'} name="model">
        <Select v-model={data.value.model} placeholder="请输入模型名称" options={options.value} filterable={true}/>
      </FormItem>
      <FormItem label="最小响应字数" labelAlign={'top'} name="min_response_length" help="-1 代表无限制">
        <InputNumber v-model={data.value.min_response_length} placeholder="请输入最小响应字数"/>
      </FormItem>
      <FormItem label="最大响应字数" labelAlign={'top'} name="max_response_length" help="-1 代表无限制">
        <InputNumber v-model={data.value.max_response_length} placeholder="请输入最大响应字数"/>
      </FormItem>
      <FormItem label="生成随机性" labelAlign={'top'} name="temperature" help="默认 0.7，上帝 AI 可设为 0.3 更稳">
        <InputNumber v-model={data.value.temperature} placeholder="请输入生成随机性" step={0.1} min={0} max={2}/>
      </FormItem>
      <FormItem label="是否启用事实核查" labelAlign={'top'} name="enable_fact_checking">
        <RadioGroup v-model={data.value.enable_fact_checking}>
          <Radio value={0}>否</Radio>
          <Radio value={1}>是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="是否允许 AI 主动 @ 他人" labelAlign={'top'} name="allow_cross_talk">
        <RadioGroup v-model={data.value.allow_cross_talk}>
          <Radio value={0}>否</Radio>
          <Radio value={1}>是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="最大思考时间（秒）" labelAlign={'top'} name="timeout_per_turn">
        <InputNumber v-model={data.value.timeout_per_turn} placeholder="请输入最大思考时间"/>
      </FormItem>
    </Form>)
  })

}

export function openRoundtableRoleUpdate(source: AiRtRole, onUpdate: () => void) {
  const data = ref<AiRtRoleUpdate>(cloneDeep(source));
  const options = computed(() => useSettingStore().modelOptions);

  const dp = DrawerPlugin({
    header: `修改${source.type === 'admin' ? '上帝' : '普通'}角色`,
    confirmBtn: '修改',
    size: "800px",
    onConfirm: async () => {
      updateAiRtRoleService(source.id, data.value)
        .then(() => {
          onUpdate();
          dp.destroy?.();
          MessageUtil.success("修改成功");
        })
        .catch(e => {
          MessageUtil.error("修改失败", e);
        })
    },
    default: () => (<Form data={data.value}>
      <FormItem label="角色名称" labelAlign={'top'} name="name">
        <Input v-model={data.value.name} placeholder="请输入角色名称"/>
      </FormItem>
      <FormItem label="提示词" labelAlign={'top'} name="prompt">
        <Textarea v-model={data.value.prompt} placeholder="请输入提示词" autosize={{ minRows: 3, maxRows: 6 }}/>
      </FormItem>
      <FormItem label="使用的模型" labelAlign={'top'} name="model">
        <Select v-model={data.value.model} placeholder="请输入模型名称" options={options.value} filterable={true}/>
      </FormItem>
      <FormItem label="最小响应字数" labelAlign={'top'} name="min_response_length" help="-1 代表无限制">
        <InputNumber v-model={data.value.min_response_length} placeholder="请输入最小响应字数"/>
      </FormItem>
      <FormItem label="最大响应字数" labelAlign={'top'} name="max_response_length" help="-1 代表无限制">
        <InputNumber v-model={data.value.max_response_length} placeholder="请输入最大响应字数"/>
      </FormItem>
      <FormItem label="生成随机性" labelAlign={'top'} name="temperature" help="默认 0.7，上帝 AI 可设为 0.3 更稳">
        <InputNumber v-model={data.value.temperature} placeholder="请输入生成随机性" step={0.1} min={0} max={2}/>
      </FormItem>
      <FormItem label="是否启用事实核查" labelAlign={'top'} name="enable_fact_checking">
        <RadioGroup v-model={data.value.enable_fact_checking}>
          <Radio value={0}>否</Radio>
          <Radio value={1}>是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="是否允许 AI 主动 @ 他人" labelAlign={'top'} name="allow_cross_talk">
        <RadioGroup v-model={data.value.allow_cross_talk}>
          <Radio value={0}>否</Radio>
          <Radio value={1}>是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="最大思考时间（秒）" labelAlign={'top'} name="timeout_per_turn">
        <InputNumber v-model={data.value.timeout_per_turn} placeholder="请输入最大思考时间"/>
      </FormItem>
    </Form>)
  })

}

export function openRoundtableRoleCxt(e: PointerEvent, source: AiRtRole, onUpdate: () => void) {
  e.preventDefault();
  e.stopPropagation();
  Cxt.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "修改",
        icon: () => <EditIcon class={'color-red'}/>,
        onClick: () => {
          openRoundtableRoleUpdate(source, onUpdate);
        }
      },
      {
        label: () => <span class={'color-red label'}>删除</span>,
        icon: () => <DeleteIcon class={'color-red'}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "删除角色")
            .then(() => {
              deleteAiRtRoleService(source.id)
                .then(() => {
                  onUpdate();
                  MessageUtil.success("删除成功");
                })
                .catch(e => {
                  MessageUtil.error("删除失败", e);
                })
            })
        }
      }
    ]
  })
}