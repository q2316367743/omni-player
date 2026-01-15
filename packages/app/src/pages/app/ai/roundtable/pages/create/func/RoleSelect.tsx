import type {AiRtRole, AiRtRoleType} from "@/entity/app/ai/roundtable";
import {DialogPlugin, Loading, Tag} from "tdesign-vue-next";
import {listAiRtRoleService} from "@/services/app/roundtable";
import "./role-select-content.less";

export function openRoleSelect(type: AiRtRoleType, onUpdate: (role?: AiRtRole) => void) {
  const availableRoles = ref<Array<AiRtRole>>([]);
  const loadingRoles = ref(true);
  
  listAiRtRoleService(type).then(e => {
    console.log(e)
    availableRoles.value = e;
  }).finally(() => {
    loadingRoles.value = false;
  });
  
  const dp = DialogPlugin({
    header: '选择角色',
    placement: "center",
    width: '600px',
    footer: false,
    default: () => (<div class="role-select-content">
      <div class="action-buttons">
        <button class="action-button" onClick={() => { onUpdate(undefined); dp.hide(); }}>
          从空开始{type === 'admin' ? '管理员 AI' : '成员 AI'}
        </button>
      </div>
      {loadingRoles.value ? (
        <div class="loading-state">
          <Loading size="medium"/>
        </div>
      ) : availableRoles.value.length === 0 ? (
        <div class="empty-state">
          <p>暂无可用角色，请先创建角色</p>
        </div>
      ) : (
        <div class="role-grid">
          {availableRoles.value.map(role => (
            <div key={role.id} class="role-card" onClick={() => { onUpdate(role); dp.hide(); }}>
              <div class="role-card-header">
                <h4 class="role-name">{role.name}</h4>
                <Tag size="small" theme={role.type === 'admin' ? 'warning' : 'default'}>
                  {role.type === 'admin' ? '管理员' : '成员'}
                </Tag>
              </div>
              <div class="role-card-body">
                <p class="role-prompt">{role.prompt || '暂无提示词'}</p>
              </div>
              <div class="role-card-footer">
                <span class="role-model">{role.model}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>)
  })
}