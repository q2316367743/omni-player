import type {YesOrNo} from "@/types/YesOrNo.ts";

/**
 * 媒体服务器
 */
export interface MediaServer {
  id: string;
  created_at: number;
  updated_at: number;

  name: string;
  url: string;
  description: string;
  is_enabled: YesOrNo;

  // username
  // password

}