import type {AiRtGroup, AiRtMeeting} from "@/entity/app/ai/roundtable";
import ContextMenu from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import {deleteAiRtMeetingService} from "@/services/app/roundtable";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";


export const onGroupMenuClick = (group: AiRtGroup, e: MouseEvent, onUpdate: () => void) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '编辑',
      icon: () => <EditIcon/>,
      onClick: () => {
        console.log('编辑讨论组', group);
      },
    }, {
      label: () => <span class={'color-red label'}>删除</span>,
      icon: () => <DeleteIcon class={'color-red'}/>,
      onClick: () => {
        onUpdate()
      }
    }]
  });
}

export const onMeetingMenuClick = (group: AiRtMeeting, e: MouseEvent, onUpdate: () => void) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '编辑',
      icon: () => <EditIcon/>,
      onClick: () => {
        console.log('编辑讨论组', group);
      },
    }, {
      label: () => <span class={'color-red label'}>删除</span>,
      icon: () => <DeleteIcon class={'color-red'}/>,
      onClick: () => {
        MessageBoxUtil.confirm("确定要删除吗？", "删除讨论组")
          .then(() => {
            deleteAiRtMeetingService(group.id).then(onUpdate);
          })
      }
    }]
  });
}