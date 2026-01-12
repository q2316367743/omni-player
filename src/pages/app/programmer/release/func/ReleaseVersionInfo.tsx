import {getReleaseVersionService} from "@/services/release/ReleaseVersionService.ts";
import type {ReleaseVersion} from "@/entity/release/ReleaseVersion.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {ReleaseAssetMeta} from "@/entity/release/ReleaseAssetMeta.ts";
import {listReleaseAssetMeta} from "@/services/release/ReleaseAssetService.ts";
import {Descriptions, DescriptionsItem, DialogPlugin, TabPanel, Tabs} from "tdesign-vue-next";
import ReleaseAsset from "@/pages/app/programmer/release/components/ReleaseAsset.vue";

export async function openReleaseVersionInfo(projectId: string, versionId: string) {
  const version = ref<ReleaseVersion | null>();
  const metas = ref(new Array<ReleaseAssetMeta>());

  getReleaseVersionService(versionId, projectId)
    .then(res => version.value = res)
    .catch(e => MessageUtil.error("获取版本错误", e));
  listReleaseAssetMeta(projectId, 'version', versionId)
    .then(res => metas.value = res)
    .catch(e => MessageUtil.error("获取附件错误", e));

  DialogPlugin({
    header: false,
    footer: false,
    placement: "center",
    width: '80vw',
    dialogClassName: "release-version-info",
    default: () => (<Tabs defaultValue={1}>
      <TabPanel label={'基本信息'} value={1}>
        <Descriptions column={1} layout={'vertical'}>
          <DescriptionsItem label={'版本'}>
            <div class={'info-item-value'}>{version.value?.version}</div>
          </DescriptionsItem>
          <DescriptionsItem label={'部署人'}>
            <div class={'info-item-value'}>{version.value?.publish_user}</div>
          </DescriptionsItem>
          <DescriptionsItem label={'部署时间'}>
            <div class={'info-item-value'}>{version.value?.publish_time ? new Date(version.value.publish_time).toLocaleString() : ''}</div>
          </DescriptionsItem>
        </Descriptions>
      </TabPanel>
      <TabPanel label={'物料'}>
        <ReleaseAsset projectId={projectId} scope={'version'} scopeId={versionId}/>
      </TabPanel>
    </Tabs>)
  })

}
