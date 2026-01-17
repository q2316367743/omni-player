import {set} from "@/util";
import {DialogPlugin, Option, Select} from "tdesign-vue-next";
import {addSpRoleAppearanceService, listSpRoleAppearanceService, listSpRoleService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";

export async function openSpRoleAppearanceAdd(
  screenplayId: string,
  sceneId: string,
  dialogualOrder: number,
  onUpdate: () => void) {
  const [roles, app] = await Promise.all([
    listSpRoleService(screenplayId),
    listSpRoleAppearanceService(screenplayId, sceneId)
  ])
  const appMap = set(app, "role_id");
  const options = roles.map(role => {
    return {
      label: role.name,
      value: role.id,
      disabled: appMap.has(role.id)
    }
  })
  const roleId = ref('');
  const dp = DialogPlugin({
    header: "添加角色入场",
    onConfirm() {
      if (!roleId.value) {
        MessageUtil.info("请选择角色");
        return;
      }
      // 添加角色入场
      addSpRoleAppearanceService({
        screenplay_id: screenplayId,
        scene_id: sceneId,
        role_id: roleId.value,
        enter_turn: dialogualOrder,
        exit_turn: 0,
        is_active: 1
      }).then(() => {
        onUpdate();
        dp.destroy?.();
        MessageUtil.success("添加成功");
      })
    },
    default: () => (<Select v-model={roleId.value} placeholder="请选择角色">
      {options.map(option => <Option value={option.value} label={option.label} disabled={option.disabled}/>)}
    </Select>)
  })
}