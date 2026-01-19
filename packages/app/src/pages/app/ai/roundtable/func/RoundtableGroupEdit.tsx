import {type AiRtGroup} from "@/entity/app/ai/roundtable";
import {deleteAiRtGroupService} from "@/services/app/roundtable";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Cxt from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";


export function openRoundtableGroupCxt(e: PointerEvent, source: AiRtGroup, onUpdate: () => void) {
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
          console.log('修改');
        }
      },
      {
        label: () => <span class={'color-red label'}>删除</span>,
        icon: () => <DeleteIcon class={'color-red'}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "删除讨论组")
            .then(() => {
              deleteAiRtGroupService(source.id)
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
