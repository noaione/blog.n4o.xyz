import { serverQueryContent } from "#content/server";
import { castBooleanNull } from "~/utils/query";
import { ContentPagedQueryParam } from "./content-paged.get";

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

  const data = await serverQueryContent(event)
    .where({
      _locale: locale?.toString(),
      _partial: false,
      _contentType: "blog",
      ...(isDraft === null ? { _draft: { $in: [true, false] } } : { _draft: isDraft }),
      tags: {
        $contains: tagCurrent,
      },
      _source: "content",
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
      tags: {
        $contains: tagCurrent,
      },
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
