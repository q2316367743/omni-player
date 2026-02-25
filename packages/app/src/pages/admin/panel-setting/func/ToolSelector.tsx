import {DrawerPlugin, Input, TabPanel, Tabs} from "tdesign-vue-next";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import PanelEntryIcon from "@/nested/panel/PanelEntry/components/PanelEntryIcon.vue";
import './ToolSelector.less';
import {type ToolItemType, ToolItemTypeOptions} from "@/global/PluginList.ts";

export function toolSelector(selectTool: (toolId: string) => void) {
  const toolStore = useToolVisibleStore();
  const toolSearchKeyword = ref('');
  const type = ref<ToolItemType>('inner');

  const filteredTools = computed(() => {
    const keyword = toolSearchKeyword.value.toLowerCase();
    if (!keyword) return toolStore.availableTools;
    return toolStore.availableTools.filter(tool => {
      if (keyword) {
        return tool.label.toLowerCase().includes(keyword) ||
          tool.id.toLowerCase().includes(keyword);
      }
      return true;
    });
  });
  const filteredTools1 = computed(() => {
    return filteredTools.value.filter(tool => tool.type === type.value)
  })

  const onSelectTool = (toolId: string) => {
    selectTool(toolId);
    dp.destroy?.();
  }
  const options = [
    {
      label: '内置插件',
      value: 'inner'
    },
    ...ToolItemTypeOptions
  ]

  const dp = DrawerPlugin({
    header: '选择工具',
    size: '900px',
    footer: false,
    default: () => <div class="tool-selector">
      <div class="search-box">
        <Input
          v-model={toolSearchKeyword.value}
          placeholder="搜索工具"
        >
        </Input>
      </div>
      <div>
        <Tabs v-model={type.value}>
          {options.map(o => <TabPanel label={o.label} value={o.value as string}/>)}
        </Tabs>
        <div class="tool-list local-scroll">
          {filteredTools1.value
            .map(tool => <div
              key={tool.id}
              class="tool-option"
              onClick={() => onSelectTool(tool.id)}
            >
              <div class="tool-option-icon">
                <PanelEntryIcon name={tool.icon}/>
              </div>
              <div class="tool-option-info">
                <div class="tool-option-label">{tool.label}</div>
                <div class="tool-option-desc">{tool.desc || '无描述'}</div>
              </div>
            </div>)}
        </div>

      </div>
    </div>
  })
}