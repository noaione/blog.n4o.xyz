import { ContentCollectionItem } from "@nuxt/content";
import { castBooleanNull, boolToNumNull } from "~/utils/query";

function intoNumber(value: string | undefined) {
  if (!value) {
    return;
  }

  const num = Number.parseInt(value, 10);

  if (Number.isNaN(num)) {
    return;
  }

  return num;
}

function getSkipNum(pageNum: number, limitNum: number) {
  return (pageNum - 1) * limitNum;
}

export type ContentPagedQuery = Pick<
  ContentCollectionItem,
  "id" | "draft" | "path" | "title" | "description" | "excerpt" | "date" | "image" | "tags" | "slug"
>;

export interface ContentPagedResponse {
  data: ContentPagedQuery[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
}

export interface ContentPagedQueryParam {
  locale: string;
  draft?: boolean;
  limit?: number;
  page?: number;
}

export default defineEventHandler(async (event) => {
  const { locale, draft, limit, page } = getQuery(event) || {};
  const config = useRuntimeConfig(event);

  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());
  const limitNum = intoNumber(limit?.toString()) || 10;
  const actualLimit = limitNum < 1 ? 1 : limitNum;
  // Non-zero-based page number
  const pageNum = intoNumber(page?.toString()) || 1;
  const skipAmount = getSkipNum(pageNum, actualLimit);

  const data = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .select("id", "path", "draft", "title", "description", "excerpt", "date", "image", "tags", "slug")
    .order("date", "DESC")
    .limit(actualLimit)
    .skip(skipAmount)
    .all();

  const totalData = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .count();

  return {
    data,
    pagination: {
      total: totalData,
      limit: actualLimit,
      page: pageNum,
      totalPage: Math.ceil(totalData / actualLimit),
    },
  };
});
