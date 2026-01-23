import {type RouteRecordRaw} from "vue-router";
import {mpGithubStoreRouter} from "@/router/modules/mp/modules/github-store.ts";
import {mpScreenplayRouter} from "@/router/modules/mp/modules/screenplay.ts";

export const mpRouters: Array<RouteRecordRaw> = [
  mpGithubStoreRouter,
  mpScreenplayRouter
]