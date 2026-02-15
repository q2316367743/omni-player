import {type RouteRecordRaw} from "vue-router";

// 直接只有详情页
export const detailRouters: Array<RouteRecordRaw> = [{
  name: "Screenplay",
  path: "/screenplay/:id",
  component: () => import("@/pages/mp/screenplay/chapter/screenplay-index.vue")
}]