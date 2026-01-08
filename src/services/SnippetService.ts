import type {PageResponse} from "@/global/PageResponse.ts";
import type {SnippetMeta, SnippetMetaWithTag} from "@/entity/snippet/SnippetMeta.ts";
import {useSql} from "@/lib/sql.ts";
import type {SnippetTag} from "@/entity/snippet/SnippetTag.ts";
import {generatePlaceholders, group, map} from "@/util";
import type {SnippetContent} from "@/entity/snippet/SnippetContent.ts";
import type {SnippetTags} from "@/entity/snippet/SnippetTags.ts";

export type { SnippetMetaWithTag };

async function fillTag(metas: Array<SnippetMeta>): Promise<Array<SnippetMetaWithTag>> {
  // 查询关联表
  const tagWiths = await useSql().query<SnippetTags>('snippet_tags').in('snippet_id', metas.map(e => e.id)).list();
  if (tagWiths.length === 0) return metas.map(e => ({...e, tags: []}));
  // 获取全部标签
  const tags = await useSql().query<SnippetTag>('snippet_tag').in('id', tagWiths.map(e => e.tag_id)).list();
  const tagMap = map(tags, 'id');
  const tagGroupMap = group(tagWiths, 'snippet_id');
  return metas.map(e => {
    const tagGroups = tagGroupMap.getOrDefault(e.id, []);
    const tags = new Array<SnippetTag>();
    tagGroups.forEach(e => {
      const tag = tagMap.get(e.tag_id);
      if (tag) {
        tags.push(tag);
      }
    });
    return {
      ...e,
      tags
    } as SnippetMetaWithTag
  })

}

/**
 * 分页插叙代码片段
 * @param keyword 关键字，如果#开头则代表搜索标签
 * @param page 页码
 * @param pageSize 每页数量
 */
export async function pageSnippet(keyword: string, page: number, pageSize: number): Promise<PageResponse<SnippetMetaWithTag>> {
  if (keyword.startsWith("#")) {
    // 搜索标签
    const totalWrap = await useSql().select<Array<{ total: number }>>(
      `select count(*)
       from snippet_meta sm
                left join snippet_tags sts on sm.id = sts.snippet_id
                left join snippet_tag st on st.id = sts.tag_id
       where st.name like '%${generatePlaceholders(1)}%'`);
    const total = totalWrap[0]?.total || 0;
    if (total === 0) return {total, records: [], pageNum: page, pageSize};
    const list = await useSql().select<Array<SnippetMeta>>(
      `select *
       from snippet_meta sm
                left join snippet_tags sts on sm.id = sts.snippet_id
                left join snippet_tag st on st.id = sts.tag_id
       where st.name like '%${generatePlaceholders(1)}%'
       LIMIT ${generatePlaceholders(1, 1)} OFFSET ${generatePlaceholders(1, 2)}`,
      [keyword, pageSize, (page - 1) * pageSize]);
    return {total, records: await fillTag(list), pageNum: page, pageSize};
  }
  // 普通查询
  const list = await useSql().query<SnippetMeta>('snippet_meta').like('name', keyword).page(page, pageSize);
  return {...list, records: await fillTag(list.records)};
}

export type Snippet = SnippetContent & SnippetMetaWithTag;

/**
 * 获取代码片段内容
 * @param id 代码片段id
 */
export async function getSnippetContent(id: string): Promise<Snippet> {
  // 获取自己
  const snippet = await useSql().query<SnippetMeta>('snippet_meta').eq('id', id).one();
  if (!snippet) return Promise.reject(new Error("代码片段不存在"));
  const content = await useSql().query<SnippetContent>('snippet_content').eq('id', id).one();
  if (!content) return Promise.reject(new Error("代码片段异常"));
  const [snippetWithTags] = await fillTag([snippet]);

  return {
    ...snippetWithTags!,
    ...content
  };
}

/**
 * 重命名代码片段
 * @param id 代码片段id
 * @param name 新名称
 */
export async function renameSnippetContent(id: string, name: string) {
  await useSql().mapper<SnippetMeta>('snippet_meta').updateById(id, {name, updated_at: Date.now()});
}

/**
 * 设置代码片段的标签
 * @param id 代码片段id
 * @param tagNames 标签名称
 */
export async function setSnippetTag(id: string, tagNames: Array<string>) {
  // 删除旧的标签关闭
  await useSql().query<SnippetTags>('snippet_tags').eq('snippet_id', id).delete();
  // 插入新的标签
  const tags = await useSql().query<SnippetTag>('snippet_tag').in('name', tagNames).list();
  const tagMap = map(tags, 'id');
  const now = Date.now();
  for (const tagName of tagNames) {
    const tag = tagMap.get(tagName);
    if (tag) {
      await useSql().mapper<SnippetTags>('snippet_tags').insert({
        snippet_id: id,
        tag_id: tag.id,
        created_at: now
      })
    }else {
      // 创建新的标签
      const newTag = await useSql().mapper<SnippetTag>('snippet_tag').insert({
        name: tagName,
        created_at: now,
        updated_at: now
      });
      await useSql().mapper<SnippetTags>('snippet_tags').insert({
        snippet_id: id,
        tag_id: newTag.id,
        created_at: now
      })
    }
  }


}

/**
 * 删除代码片段
 * @param id 代码片段id
 */
export async function deleteSnippet(id: string) {
  // 删除代码片段
  await useSql().mapper<SnippetMeta>('snippet_meta').deleteById(id);
  // 删除关联关系
  await useSql().query<SnippetTags>('snippet_tags').eq('snippet_id', id).delete();
  // 删除内容
  await useSql().mapper<SnippetContent>('snippet_content').deleteById(id);
}

/**
 * 新增代码片段
 * @param name 名称
 */
export async function addSnippet(name: string) {
  await useSql().beginTransaction(async (sql) => {
    // 新增代码片段元数据
    const newMeta =  await sql.mapper<SnippetMeta>('snippet_meta').insert({
      name,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    // 新增代码片段内容
    await sql.mapper<SnippetContent>('snippet_content').insertSelf({
      id: newMeta.id,
      language: 'javascript',
      content: '',
    })
  })
}

/**
 * 更新代码片段内容
 * @param id 代码片段id
 * @param content 内容
 * @param language 语言
 */
export async function updateSnippetContent(id: string, content: string, language: string) {
  await useSql().beginTransaction(async (sql) => {
    // 更新内容
    await sql.mapper<SnippetContent>('snippet_content').updateById(id, { content, language });
    // 更新元数据时间
    await sql.mapper<SnippetMeta>('snippet_meta').updateById(id, { updated_at: Date.now() });
  });
}