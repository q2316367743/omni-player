import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon} from "tdesign-icons-vue-next";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";

export const openMainContext = async (toolId: string | undefined | null, row: number, col: number, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!toolId) return;

  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: () => <span class={'label color-red'}>删除</span>,
      icon: () => <DeleteIcon class={'color-red'}/>,
      onClick: () => {
        const toolStore = useToolVisibleStore();
        toolStore.setMainGridTool(row, col, null);
      }
    }]
  })
}
