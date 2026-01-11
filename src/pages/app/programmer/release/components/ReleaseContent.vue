<template>
  <div class="release-content">
    <table class="release-table">
      <thead>
      <tr>
        <th class="corner-cell">
          <span class="header-label">版本</span>
        </th>
        <th v-for="instance in instances" :key="instance.id" class="instance-cell"
            @click="openReleaseInstanceInfo(instance.project_id, instance.id)"
            @contextmenu="openReleaseInstanceContextmenu(instance, listInstance, $event)">
          <div class="instance-name">{{ instance.name }}</div>
          <div v-if="instance.desc" class="instance-desc">{{ instance.desc }}</div>
        </th>
        <th class="action-cell">
          <t-button theme="primary" variant="text" shape="square"
                    @click="openReleaseInstanceAdd(select.id, listInstance)">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="version in versions" :key="version.id"
          :class="{ 'row-hover': hoveredRow === version.id }"
          @mouseenter="hoveredRow = version.id"
          @mouseleave="hoveredRow = ''">
        <td class="corner-cell"
            @click="openReleaseVersionInfo(version.project_id, version.id)"
            @contextmenu="openReleaseVersionContextmenu(version, listVersion, $event)">
          <div class="version-info">
            <div class="version-number">{{ version.version }}</div>
            <div class="version-meta">
              <span class="version-time">{{ formatDate(version.deploy_time) }}</span>
              <span class="version-user">{{ version.deploy_user }}</span>
            </div>
          </div>
        </td>
        <td v-for="instance in instances" :key="`${instance.id}-${version.id}`">
          <div v-if="deploySet.has(`${instance.id}-${version.id}`)" class="deploy-badge deployed">
            <check-icon size="16px"/>
            <span>已部署</span>
          </div>
          <div v-else class="deploy-badge deploy-action" @click="addDeploy(instance.id, version.id)">
            <span>部署</span>
          </div>
        </td>
        <td class="action-cell"></td>
      </tr>
      </tbody>
      <tfoot>
      <tr>
        <td class="corner-cell">
          <t-button theme="primary" variant="text" block
                    @click="openReleaseVersionAdd(select.id, listVersion)">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </td>
      </tr>
      </tfoot>
    </table>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseProject} from "@/entity/release/ReleaseProject.ts";
import type {ReleaseInstance} from "@/entity/release/ReleaseInstance.ts";
import type {ReleaseVersion} from "@/entity/release/ReleaseVersion.ts";
import type {ReleaseDeploy} from "@/entity/release/ReleaseDeploy.ts";
import {openReleaseInstanceInfo} from "@/pages/app/programmer/release/func/ReleaseInstanceInfo.tsx";
import {openReleaseVersionInfo} from "@/pages/app/programmer/release/func/ReleaseVersionInfo.tsx";
import {
  openReleaseInstanceAdd, openReleaseInstanceContextmenu,
} from "@/pages/app/programmer/release/func/ReleaseInstanceEdit.tsx";
import {
  openReleaseVersionAdd, openReleaseVersionContextmenu,
} from "@/pages/app/programmer/release/func/ReleaseVersionEdit.tsx";
import {
  addReleaseDeployService,
  listReleaseDeployService,
  listReleaseInstanceService,
  listReleaseVersionService
} from "@/services/release";
import {AddIcon, CheckIcon} from "tdesign-icons-vue-next";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  select: {
    type: Object as PropType<ReleaseProject>,
    required: true
  }
});

const instances = ref(new Array<ReleaseInstance>());
const versions = ref(new Array<ReleaseVersion>());
const deployItems = ref(new Array<ReleaseDeploy>());
const hoveredRow = ref('');

const deploySet = computed(() => new Set(deployItems.value.map(e => `${e.instance_id}-${e.version_id}`)));

const addDeploy = (instanceId: string, versionId: string) => {
  MessageBoxUtil.confirm('确定要部署吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    addReleaseDeployService({
      instance_id: instanceId,
      version_id: versionId,
      project_id: props.select.id
    }).then(() => {
      MessageUtil.success('部署成功');
      listDeploy();
    })
  })
}

const listInstance = async () => {
  instances.value = await listReleaseInstanceService(props.select.id);
};
const listVersion = async () => {
  versions.value = await listReleaseVersionService(props.select.id);
};
const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(props.select.id);
};

watch(() => props.select, () => {
  listInstance();
  listVersion();
  listDeploy();
}, {immediate: true})
</script>
<style scoped lang="less">
.release-content {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  overflow: auto;
  background: var(--td-bg-color-page);
  padding: 8px;

  .release-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: var(--fluent-card-bg);
    border-radius: var(--fluent-radius-card);
    box-shadow: var(--fluent-card-shadow);
    border: 1px solid var(--fluent-card-border);
    backdrop-filter: var(--fluent-acrylic-blur);
    transition: box-shadow var(--fluent-transition-normal);

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--td-scroll-track-color);
      border-radius: var(--td-radius-small);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--td-scrollbar-color);
      border-radius: var(--td-radius-small);
      transition: background var(--fluent-transition-fast);

      &:hover {
        background: var(--td-scrollbar-hover-color);
      }
    }

    &:hover {
      box-shadow: var(--fluent-card-shadow-hover);
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 10;

      tr {
        border-bottom: 1px solid var(--fluent-border-subtle);
        backdrop-filter: var(--fluent-acrylic-blur);

        th {
          padding: 12px 16px;
          text-align: center;
          border-right: 1px solid var(--fluent-border-subtle);
          font-weight: 600;

          &:last-child {
            border-right: none;
          }

          &.corner-cell {
            width: 140px;
            min-width: 140px;
            max-width: 140px;
            position: sticky;
            left: 0;
            z-index: 20;
            border-right: 1px solid var(--fluent-border-subtle);

            .header-label {
              font-size: 13px;
              color: var(--td-text-color-primary);
            }
          }

          &.instance-cell {
            min-width: 100px;
            cursor: pointer;
            user-select: none;
            transition: background var(--fluent-transition-fast);

            &:hover {
              background: var(--fluent-item-hover);
            }

            .instance-name {
              font-size: 14px;
              color: var(--td-text-color-primary);
            }

            .instance-desc {
              font-size: 12px;
              color: var(--td-text-color-placeholder);
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          &.action-cell {
            width: 48px;
            min-width: 48px;
            padding: 8px;
          }
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--fluent-border-subtle);
        transition: background var(--fluent-transition-fast);

        &:hover {
          background: var(--fluent-item-hover);
        }

        &.row-hover {
          background: var(--fluent-item-hover);
        }

        &:last-child {
          border-bottom: none;
        }

        td {
          padding: 12px 16px;
          text-align: center;
          border-right: 1px solid var(--fluent-border-subtle);

          &:last-child {
            border-right: none;
          }

          &.corner-cell {
            width: 140px;
            min-width: 140px;
            max-width: 140px;
            position: sticky;
            left: 0;
            z-index: 5;
            cursor: pointer;
            user-select: none;
            transition: background var(--fluent-transition-fast);

            &:hover {
              background: var(--fluent-item-hover);
            }

            .version-info {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;

              .version-number {
                font-size: 14px;
                font-weight: 600;
                color: var(--td-text-color-primary);
              }

              .version-meta {
                display: flex;
                gap: 8px;
                font-size: 11px;
                color: var(--td-text-color-placeholder);

                .version-time {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }

                .version-user {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }
          }

          .deploy-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: var(--td-radius-round);
            font-size: 12px;
            font-weight: 500;
            transition: all var(--fluent-transition-fast);

            &.deployed {
              background: var(--td-success-color-1);
              color: var(--td-success-color-6);
              border: 1px solid var(--td-success-color-3);

              &:hover {
                background: var(--td-success-color-2);
                box-shadow: var(--fluent-elevation-1);
              }
            }

            &.deploy-action {
              background: var(--td-brand-color);
              color: var(--td-text-color-anti);
              border: 1px solid var(--td-brand-color);
              cursor: pointer;
              opacity: 0;
              visibility: hidden;

              &:hover {
                background: var(--td-brand-color-hover);
                box-shadow: var(--fluent-elevation-1);
              }
            }

            span {
              white-space: nowrap;
            }
          }

          &:hover .deploy-action {
            opacity: 1;
            visibility: visible;
          }
        }

        .action-cell {
          width: 48px;
          min-width: 48px;
        }
      }
    }

    tfoot {
      tr {
        border-top: 1px solid var(--fluent-border-subtle);

        td {
          padding: 8px 12px;
          border-right: 1px solid var(--fluent-border-subtle);
          position: sticky;
          left: 0;

          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }
}
</style>
