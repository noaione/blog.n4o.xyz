import { castBooleanNull } from "~/utils/query";
import { ContentPagedQueryParam } from "./content-paged.get";
import { boolToNumNull } from "../../utils/query";

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

export interface ContentTagsPagedQueryParam extends ContentPagedQueryParam {
  tag: string;
}

export default defineEventHandler(async (event) => {
  const { locale, draft, tag, limit, page } = getQuery(event) || {};
  const config = useRuntimeConfig(event);
  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());
  const tagCurrent = tag?.toString();
  const limitNum = intoNumber(limit?.toString()) || 10;
  const actualLimit = limitNum < 1 ? 1 : limitNum;
  // Non-zero-based page number
  const pageNum = intoNumber(page?.toString()) || 1;
  const skipAmount = getSkipNum(pageNum, limitNum < 1 ? 1 : limitNum);

  if (!tagCurrent) {
    throw createError({
      statusCode: 400,
      message: "Missing `tag` query parameter",
    });
  }

  const data = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("tags", "LIKE", `%${tagCurrent}%`)
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .select("id", "path", "draft", "slug", "title", "description", "excerpt", "date", "image", "tags", "slug")
    .order("date", "ASC")
    .limit(actualLimit)
    .skip(skipAmount)
    .all();

  const totalData = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("tags", "LIKE", `%${tagCurrent}%`)
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
