import type {NetworkServer} from "@/entity/NetworkServer.ts";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import {NetworkServerCmsXml} from "@/modules/network/services/CmsXml/NetworkServerCmsXml.ts";
import {NetworkServerCmsJson} from "@/modules/network/services/CmsJson/NetworkServerCmsJson.ts";


export function createNetworkServer(res: NetworkServer): INetworkServer {
  switch (res.type) {
    case 'CMS:XML':
      return new NetworkServerCmsXml(res);
    case 'CMS:JSON':
      return new NetworkServerCmsJson(res);
    default:
      throw new Error(`Unsupported network server type: ${res.type}`);
  }
}