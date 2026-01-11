import {DialogPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import type {ReleaseProjectCore} from "@/entity/release/ReleaseProject.ts";
import {addReleaseProject} from "@/services/release";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function openReleaseProjectDialog(onUpdate: () => void) {
  const data = ref<ReleaseProjectCore>({
    name: '',
    desc: '',
  });
  const dp = DialogPlugin({
    header: '发布项目',
    width: '450px',
    confirmBtn: '发布',
    default: () => <Form>
      <FormItem label={'项目名'} labelAlign={'top'}>
        <Input placeholder={'请输入项目名'} v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'项目描述'} labelAlign={'top'}>
        <Textarea placeholder={'请输入项目描述'} v-model={data.value.desc} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>,
    onConfirm() {
      addReleaseProject(data.value).then(() => {
        onUpdate();
        dp.destroy();
        MessageUtil.success("发布成功");
      })
    }
  })
}