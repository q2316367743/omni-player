import type {SnippetTag} from "@/entity/snippet/SnippetTag.ts";

export interface SnippetMeta {
  id: string;
  created_at: number;
  updated_at: number;

  name: string;
}

export interface SnippetMetaWithTag extends SnippetMeta{

  tags: Array<SnippetTag>;

}