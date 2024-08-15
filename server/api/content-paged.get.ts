import { serverQueryContent } from "#content/server";
import { castBooleanNull } from "~/utils/query";
import { ExtendedParsedContent } from "../plugins/content";

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
  ExtendedParsedContent,
  "_id" | "_draft" | "_path" | "title" | "description" | "excerpt" | "date" | "image" | "tags" | "slug"
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

  const data = await serverQueryContent(event)
    .where({
      _locale: locale?.toString(),
      _partial: false,
      _contentType: "blog",
      _source: "content",
      ...(isDraft === null ? { _draft: { $in: [true, false] } } : { _draft: isDraft }),
    })
    .only(["_id", "_draft", "_path", "title", "description", "excerpt", "date", "image", "tags", "slug"])
    .sort({
      date: -1,
    })
    .limit(actualLimit)
    .skip(skipAmount)
    .find();

  const totalData = await serverQueryContent(event)
    .where({
      _locale: locale?.toString(),
      _partial: false,
      _contentType: "blog",
      ...(isDraft === null ? { _draft: { $in: [true, false] } } : { _draft: isDraft }),
    })
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
