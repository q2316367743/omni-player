import type {NetworkServer} from "@/entity/NetworkServer.ts";
import type {INetworkServer} from "@/modules/network/INetworkServer.ts";
import {NetworkServerMc10Xml} from "@/modules/network/services/mc10/NetworkServerMc10Xml.ts";
import {NetworkServerMc10Json} from "@/modules/network/services/mc10/NetworkServerMc10Json.ts";


export function createNetworkServer(res: NetworkServer): INetworkServer {
  switch (res.type) {
    case 'mc10':
      if (res.format === 'xml') {
        return new NetworkServerMc10Xml(res);
      } else {
        return new NetworkServerMc10Json(res);
      }
    default:
      throw new Error(`Unsupported network server type: ${res.type}`);
  }
}