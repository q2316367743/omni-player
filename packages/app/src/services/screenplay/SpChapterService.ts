import type {SpChapter, SpChapterContent, SpChapterCore, SpSceneCore} from "@/entity/screenplay";
import {useSpSql} from "@/lib/sql.ts";
import {addSpSceneService} from "@/services/screenplay/SpSceneService.ts";

export async function listSpChapterService(screenplayId: string) {
  return useSpSql().query<SpChapter>('sp_chapter').eq('screenplay_id', screenplayId).list();
}

export type SpChapterAdd = SpChapterCore & Omit<SpSceneCore, 'chapter_id'>;

export async function addSpChapterService(data: SpChapterAdd) {
  // 寻找上一个
  const latest = await useSpSql().query<SpChapter>('sp_chapter')
    .select('index')
    .eq('screenplay_id', data.screenplay_id)
    .orderByDesc('index')
    .get();
  const now = Date.now();
  const {id} = await useSpSql().mapper<SpChapter>('sp_chapter').insert({
    screenplay_id: data.screenplay_id,
    title: data.title,
    description: data.description,
    created_at: now,
    updated_at: now,
    index: (latest?.index || 0) + 1
  });
  // 自动创建场景
  try {
    await addSpSceneService({
      screenplay_id: data.screenplay_id,
      chapter_id: id,
      name: '',
      description: data.description,
      narrative_goal: data.narrative_goal,
      key_clues: data.key_clues,
      required_revelations: data.required_revelations,
      termination_strategy: data.termination_strategy
    })
  } catch (e) {
    await useSpSql().mapper<SpChapter>('sp_chapter').deleteById(id);
    throw e;
  }
}

export async function updateSpChapterService(id: string, data: Partial<SpChapterCore>) {
  const now = Date.now();
  return useSpSql().mapper<SpChapter>('sp_chapter').updateById(id, {
    ...data,
    updated_at: now
  });
}

export async function removeSpChapterService(id: string, screenplayId: string) {
  const latest = await useSpSql().query<SpChapter>('sp_chapter')
    .select('id')
    .eq('screenplay_id', screenplayId)
    .orderByDesc('index')
    .get();
  if (latest?.id !== id) return Promise.reject(new Error('请勿删除非最后一个章节'));
  return useSpSql().mapper<SpChapter>('sp_chapter').deleteById(id);
}

// ----------------------------- 内容 -----------------------------

export async function listSpChapterContentService(chapterId: string) {
  return useSpSql().query<SpChapterContent>('sp_chapter_content')
    .eq('chapter_id', chapterId).list();
}

export async function updateSpChapterContent(id: string, content: string) {
  return useSpSql().mapper<SpChapterContent>('sp_chapter_content').updateById(id, {
    content
  });
}