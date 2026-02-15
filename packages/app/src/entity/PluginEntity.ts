import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {PluginDefine} from "@/global/PluginDefine.ts"

export interface PluginEntityCore {
  identifier:string;
  name: string;
  version: string;
  main: string;
  define: string;

}

export interface PluginEntity extends BaseEntity, PluginEntityCore {
}

export interface PluginEntityCoreView {
  identifier:string;
  name: string;
  version: string;
  main: string;
  define: PluginDefine;
}

export interface PluginEntityView extends BaseEntity, PluginEntityCoreView {
}