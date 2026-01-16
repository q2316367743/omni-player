import {DialogPlugin, Form, FormItem, Input, TagInput, Textarea} from "tdesign-vue-next";
import type {Screenplay, ScreenplayCoreView} from "@/entity/screenplay";
import {addScreenplayService, deleteScreenplayService, updateScreenplayService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openScreenplayAdd(onUpdate: () => void) {
  const data = ref<ScreenplayCoreView>({
    title: '',
    background: '',
    tags: []
  })
  const dp = DialogPlugin({
    header: '新建剧本',
    default: () => (<Form>
      <FormItem label={'剧本标题'} labelAlign={'top'}>
        <Input v-model={data.value.title} placeholder={'请输入标题'}></Input>
      </FormItem>
      <FormItem label={'剧本标签'} labelAlign={'top'} help={'按回车新增'}>
        <TagInput v-model={data.value.tags}/>
      </FormItem>
      <FormItem label={'背景故事'} labelAlign={'top'}>
        <Textarea v-model={data.value.background} placeholder={'请输入背景故事'} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>),
    confirmBtn: '新建',
    onConfirm() {
      addScreenplayService(data.value)
        .then(() => {
          onUpdate()
          dp.destroy()
          MessageUtil.success("新建成功")
        })
        .catch(e => {
          MessageUtil.error("新建失败", e)
        })
    }
  })
}


export function openScreenplayUpdate(old: Screenplay, onUpdate: () => void) {
  const data = ref<ScreenplayCoreView>({
    title: old.title,
    background: old.background,
    tags: old.tags.split(',')
  })
  const dp = DialogPlugin({
    header: '新建剧本',
    default: () => (<Form>
      <FormItem label={'剧本标题'} labelAlign={'top'}>
        <Input v-model={data.value.title} placeholder={'请输入标题'}></Input>
      </FormItem>
      <FormItem label={'剧本标签'} labelAlign={'top'} help={'按回车新增'}>
        <TagInput v-model={data.value.tags}/>
      </FormItem>
      <FormItem label={'背景故事'} labelAlign={'top'}>
        <Textarea v-model={data.value.background} placeholder={'请输入背景故事'} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>),
    confirmBtn: '新建',
    onConfirm() {
      updateScreenplayService(old.id, data.value)
        .then(() => {
          onUpdate()
          dp.destroy()
          MessageUtil.success("新建成功")
        })
        .catch(e => {
          MessageUtil.error("新建失败", e)
        })
    }
  })
}

export function deleteScreenplay(id: string, onUpdate: () => void) {
  MessageBoxUtil.confirm("确定要删除吗？", "删除剧本")
    .then(() => {
      deleteScreenplayService(id)
        .then(() => {
          MessageUtil.success("删除成功")
          onUpdate()
        })
        .catch(e => {
          MessageUtil.error("删除失败", e)
        })
    })
}