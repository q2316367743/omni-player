import {DialogPlugin, Form, FormItem, Input, Select} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {addAiChatGroupService} from "@/services/app/chat";
import type {AiChatGroupCore} from "@/entity/app/ai/chat";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

export function openAddAiChatGroupDialog(onUpdate: () => void) {
  const {aiSetting, modelOptions} = useSettingStore();
  const data = ref<AiChatGroupCore>({
    name: '',
    prompt: '',
    model: aiSetting.defaultChatModel,
    sort: 0
  });
  const dp = DialogPlugin({
    header: "创建分组",
    closeBtn: true,
    placement: "center",
    draggable: true,
    confirmBtn: '创建',
    width: '450px',
    default: () => <Form>
      <FormItem label={'分组名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} autofocus={true} placeholder={'请输入分组名称'} maxlength={8}
               showLimitNumber={true}/>
      </FormItem>
      <FormItem label={'分组模型'} labelAlign={'top'}>
        <Select v-model={data.value.model} placeholder={'请选择分组模型'} options={modelOptions} filterable={true}
                clearable={true}/>
      </FormItem>
      <div style={{
        color: 'var(--td-text-color-secondary)',
        marginTop: '16px',
        fontSize: 'var(--td-font-size-body-medium)'
      }}>什么是分组？
      </div>
      <div
        style={{
          color: 'var(--td-text-color-placeholder)',
          marginTop: '8px'
        }}>分组功能支持对话分类管理，并通过专属指令定制回复，使交流更专注、个性化且持续发展。
      </div>
    </Form>,
    onConfirm() {
      addAiChatGroupService(data.value).then(() => {
        dp.destroy();
        MessageUtil.success("新增成功！");
        onUpdate();
      }).catch(e => {
        MessageUtil.error("新增失败！", e);
      })
    }
  })
}