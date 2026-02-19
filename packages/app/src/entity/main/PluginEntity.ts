import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface PluginEntityCore {
  label: string;
  icon: string;
  description: string;
  platform: string;
  type: string;
  payload: string;
}

export interface PluginEntity extends BaseEntity, PluginEntityCore {
}
