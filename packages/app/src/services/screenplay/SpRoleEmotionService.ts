import type {SpRoleEmotion} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";

export function listSpRoleEmotionService(screenplayId: string) {
  return useSpSql().query<SpRoleEmotion>('sp_role_emotion')
    .eq('screenplay_id', screenplayId)
    .list();
}
export function getSpRoleEmotionService(screenplayId: string, roleId: string) {
  return useSpSql().query<SpRoleEmotion>('sp_role_emotion')
    .eq('screenplay_id', screenplayId)
    .eq('role_id', roleId)
    .get();
}

export function updateSpRoleEmotionService(id: string, emotion: Partial<SpRoleEmotion>) {
  return useSpSql().mapper<SpRoleEmotion>('sp_role_emotion').updateById(id, {
    ...emotion,
    updated_at: Date.now()
  })
}