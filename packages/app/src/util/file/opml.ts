import type {SubscribeItem} from "@/entity/subscribe";
import {XMLBuilder} from "fast-xml-parser";
import {XMLParser} from "fast-xml-parser";
import { useSnowflake } from "@/util";

export function export2Opml(items: Array<SubscribeItem>): string {
  const folderMap = new Map<string, Array<SubscribeItem>>();

  items.forEach(item => {
    const folder = item.folder || "";
    if (!folderMap.has(folder)) {
      folderMap.set(folder, []);
    }
    folderMap.get(folder)!.push(item);
  });

  const outlines: any[] = [];

  folderMap.forEach((folderItems, folderName) => {
    if (folderName) {
      const folderOutline: any = {
        "@_text": folderName
      };
      const children = folderItems
        .sort((a, b) => a.sequence - b.sequence)
        .map(item => ({
          "@_text": item.name,
          "@_xmlUrl": item.url,
          "@_htmlUrl": item.url
        }));
      if (children.length > 0) {
        folderOutline.outline = children;
      }
      outlines.push(folderOutline);
    } else {
      folderItems
        .sort((a, b) => a.sequence - b.sequence)
        .forEach(item => {
          outlines.push({
            "@_text": item.name,
            "@_xmlUrl": item.url,
            "@_htmlUrl": item.url
          });
        });
    }
  });

  const opmlData = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8"
    },
    opml: {
      "@_version": "2.0",
      head: {
        title: "My Subscriptions",
        dateCreated: new Date().toISOString()
      },
      body: {
        outline: outlines
      }
    }
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true
  });

  return builder.build(opmlData);
}

export function importByOpml(opml: string): Array<SubscribeItem> {
  const parser = new XMLParser({
    attributeNamePrefix: "",
    ignoreAttributes: false,
    removeNSPrefix: true,
    trimValues: true
  });

  const parsed = parser.parse(opml);
  const body = parsed.opml?.body;
  if (!body) return [];

  const items: Array<SubscribeItem> = [];
  const now = Date.now();
  let sequence = 0;

  function processOutlines(outlines: any, folder: string = "") {
    const outlineArray = Array.isArray(outlines) ? outlines : [outlines];
    
    outlineArray.forEach((outline: any) => {
      if (outline.xmlUrl) {
        items.push({
          id: useSnowflake().nextId(),
          created_at: now,
          updated_at: now,
          icon: "",
          count: 0,
          un_read_count: 0,
          url: outline.xmlUrl,
          name: outline.text || outline.title || "",
          folder: folder,
          sequence: sequence++
        });
      } else if (outline.outline) {
        processOutlines(outline.outline, outline.text || outline.title || "");
      }
    });
  }

  const bodyOutlines = body.outline;
  if (bodyOutlines) {
    processOutlines(bodyOutlines);
  }

  return items;
}
