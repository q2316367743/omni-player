import type {ToolItem, ToolItemTypeOuter} from "@/global/PluginList.ts";
import {DrawerPlugin, Form, FormItem, Input, Select, Textarea} from "tdesign-vue-next";
import XhAvatar from "@/components/xiaohei/XhAvatar.vue";
import {addPluginService} from "@/services/main/PluginService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function addPluginDrawer(onUpdate: () => void) {
  const data = ref<ToolItem<ToolItemTypeOuter>>({
    id: '',
    label: '',
    icon: '',
    desc: '',
    platform: [],
    type: 'exe',
    payload: {
      path: ''
    }
  });

  const typeOptions = [
    { label: '第三方插件', value: 'plugin' },
    { label: '网页链接', value: 'link' },
    { label: '可执行文件', value: 'exe' },
    { label: '脚本', value: 'script' },
    { label: '文件夹', value: 'folder' },
    { label: '文件', value: 'file' },
  ];

  const platformOptions = [
    { label: 'Windows', value: 'windows' },
    { label: 'Mac OS', value: 'macos' },
    { label: 'Linux', value: 'linux' },
  ];

  const renderPayloadFields = () => {
    const type = data.value.type;
    switch (type) {
      case 'link':
        return (
          <>
            <FormItem label="链接地址" labelAlign="top">
              <Input v-model={(data.value.payload as any).url} placeholder="请输入链接地址" />
            </FormItem>
            <FormItem label="打开方式" labelAlign="top">
              <Input v-model={(data.value.payload as any).openWith} placeholder="可选：指定浏览器路径" />
            </FormItem>
          </>
        );
      case 'exe':
      case 'script':
        return (
          <FormItem label="文件路径" labelAlign="top">
            <Input v-model={(data.value.payload as any).path} placeholder="请输入可执行文件路径" />
          </FormItem>
        );
      case 'folder':
        return (
          <FormItem label="文件夹路径" labelAlign="top">
            <Input v-model={(data.value.payload as any).path} placeholder="请输入文件夹路径" />
          </FormItem>
        );
      case 'file':
        return (
          <>
            <FormItem label="文件路径" labelAlign="top">
              <Input v-model={(data.value.payload as any).path} placeholder="请输入文件路径" />
            </FormItem>
            <FormItem label="打开方式" labelAlign="top">
              <Input v-model={(data.value.payload as any).openWith} placeholder="可选：指定打开程序路径" />
            </FormItem>
          </>
        );
      case 'plugin':
        return (
          <>
            <FormItem label="插件路径" labelAlign="top">
              <Input v-model={(data.value.payload as any).path} placeholder="请输入插件路径" />
            </FormItem>
          </>
        );
      default:
        return null;
    }
  };

  const dp = DrawerPlugin({
    header: '新增插件',
    size: '800px',
    onConfirm: () => {
      if (!data.value.label) {
        MessageUtil.warning('请输入插件标签');
        return;
      }
      if (!data.value.id) {
        MessageUtil.warning('请输入插件ID');
        return;
      }
      addPluginService(data.value).then(() => {
        onUpdate();
        MessageUtil.success("新增成功");
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    },
    default: () => (
      <Form data={data.value} labelWidth="80px">
        <FormItem label="插件ID" labelAlign="top">
          <Input v-model={data.value.id} placeholder="请输入唯一标识符，如：my-plugin" />
        </FormItem>
        <FormItem label="图标" labelAlign="top">
          <XhAvatar v-model={data.value.icon} folder="setting/plugin" size={80} editable={true} />
        </FormItem>
        <FormItem label="标签" labelAlign="top">
          <Input v-model={data.value.label} placeholder="请输入插件显示名称" />
        </FormItem>
        <FormItem label="描述" labelAlign="top">
          <Textarea v-model={data.value.desc} placeholder="请输入插件描述" autosize={{ minRows: 2, maxRows: 4 }} />
        </FormItem>
        <FormItem label="类型" labelAlign="top">
          <Select
            v-model={data.value.type}
            placeholder="请选择插件类型"
            options={typeOptions}
            onChange={() => {
              data.value.payload = { path: '' } as any;
            }}
          />
        </FormItem>
        <FormItem label="平台" labelAlign="top">
          <Select
            v-model={data.value.platform}
            placeholder="请选择支持的平台（可多选）"
            options={platformOptions}
            multiple
            clearable
          />
        </FormItem>
        <FormItem label="载荷配置" labelAlign="top">
          <div style="padding: 12px; background: var(--monica-warm-bg-secondary); border-radius: 8px;">
            {renderPayloadFields()}
          </div>
        </FormItem>
      </Form>
    )
  });
}
