import {set} from "@/util";
import {DialogPlugin, Option, Select} from "tdesign-vue-next";
import {addSpRoleAppearanceService, listSpRoleAppearanceService, listSpRoleService} from "@/services/screenplay";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {Screenplay, SpRole, SpScene} from "@/entity/screenplay";
import {askAiScreenplayNarrator} from "@/modules/ai/screenplay/AiScreenplayNarrator.ts";

export async function openSpRoleAppearanceAdd(
  screenplayId: string,
  sceneId: string,
  onUpdate: () => Promise<void>,
  screenplay?: Screenplay,
  scene?: SpScene,
  roleMap?: Map<string, SpRole>,
  narrator?: SpRole
) {
  const [roles, app] = await Promise.all([
    listSpRoleService(screenplayId, 'member'),
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
  const entryType = ref<'normal' | 'quiet' | 'dramatic' | 'sudden'>('normal');
  
  const dp = DialogPlugin({
    header: "添加角色入场",
    onConfirm() {
      if (!roleId.value) {
        MessageUtil.info("请选择角色");
        return;
      }
      const role = roles.find(r => r.id === roleId.value);
      if (!role) {
        MessageUtil.error("角色不存在");
        return;
      }
      
      addSpRoleAppearanceService({
        screenplay_id: screenplayId,
        scene_id: sceneId,
        role_id: roleId.value,
        is_active: 1
      }).then(async () => {
        await onUpdate();
        dp.destroy?.();
        MessageUtil.success("添加成功");
        
        if (screenplay && scene && roleMap && narrator) {
          const entryTypeMap = {
            'normal': '正常入场',
            'quiet': '悄悄入场',
            'dramatic': '戏剧性入场',
            'sudden': '突发入场'
          };
          
          await askAiScreenplayNarrator({
            narrator: narrator,
            screenplay: screenplay,
            scene: scene,
            roles: [role],
            dialogues: [],
            roleMap: roleMap,
            task: 'describe_role_entry',
            triggerReason: `${role.name}${entryTypeMap[entryType.value]}`
          });
          await onUpdate();
        }
      })
    },
    default: () => (
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <Select v-model={roleId.value} placeholder="请选择角色">
          {options.map(option => <Option value={option.value} label={option.label} disabled={option.disabled}/>)}
        </Select>
        <Select v-model={entryType.value} placeholder="请选择入场类型">
          <Option value="normal" label="正常入场"/>
          <Option value="quiet" label="悄悄入场"/>
          <Option value="dramatic" label="戏剧性入场"/>
          <Option value="sudden" label="突发入场"/>
        </Select>
      </div>
    )
  })
}