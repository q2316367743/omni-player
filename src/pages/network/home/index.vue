<template>
  <t-layout class="h-full w-full">
    <t-aside>
      <t-menu v-model="categoryId">
        <t-menu-item value="" :disabled="loading">首页</t-menu-item>
        <template v-for="cate in categories" :key="cate.id">
          <t-submenu v-if="cate.children && cate.children.length > 0" :value="cate.id" :title="cate.name">
            <t-menu-item v-for="child in cate.children" :key="child.id" :value="child.name" :disabled="loading">
              {{ child.name }}
            </t-menu-item>
          </t-submenu>
          <t-menu-item v-else :value="cate.id" :disabled="loading">{{ cate.name }}</t-menu-item>
        </template>
      </t-menu>
    </t-aside>
    <t-content class="h-full">
      <t-loading :loading v-if="categoryId">
        <HomeVideoCard v-for="item in items" :item="item" :key="item.id"/>
      </t-loading>
      <t-loading :loading v-else>
        <HomeRecommendCard v-for="item in recommends" :item="item" :key="item.id"/>
      </t-loading>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {useNetworkServerStore} from "@/store/NetworkServerStore.ts";
import type {NetworkRecommend} from "@/modules/network/types/NetworkRecommend.ts";
import type {NetworkCategory} from "@/modules/network/types/NetworkCategory.ts";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";
import HomeVideoCard from "@/pages/network/home/components/HomeVideoCard.vue";
import HomeRecommendCard from "@/pages/network/home/components/HomeRecommendCard.vue";

const route = useRoute();

const networkId = route.params.id as string;

const categoryId = ref('');

const recommends = ref(new Array<NetworkRecommend>());
const categories = ref(new Array<NetworkCategory>());
const items = ref(new Array<NetworkListItem>());
const page = ref(1);
const total = ref(0);

const loading = ref(false);

let client: INetworkServer | null = null;


onMounted(async () => {
  client = await useNetworkServerStore().getServerClient(networkId);
  // 获取home
  const res1 = await client.home(page.value);
  console.log(res1)
  recommends.value = res1.recommends;
  categories.value = res1.categories;
  page.value = res1.page;
  total.value = res1.total;
})

watch(categoryId, async val => {
  if (!client) return;
  if (loading.value) return;
  page.value = 0;
  total.value = 0;
  loading.value = true;
  try {
    if (val) {
      const res = await client.getVideos(val, page.value);
      items.value = res.data;
      page.value = res.page;
      total.value = res.total;
    } else {
      const res = await client.home(page.value)
      recommends.value = res.recommends;
      categories.value = res.categories;
      page.value = res.page;
      total.value = res.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }

})


</script>
<style scoped lang="less">

</style>
