import { serverQueryContent } from "#content/server";
import { castBooleanNull } from "~/utils/query";

export default defineEventHandler(async (event) => {
  const { locale, draft, path, slug } = getQuery(event) || {};
  const config = useRuntimeConfig(event);
  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());
  const currentPath = path?.toString();
  const currentSlug = slug?.toString();

  if (!currentPath && !currentSlug) {
    throw createError({
      statusCode: 400,
      message: "Missing `path` or `slug` query parameter",
    });
  }

  const data = await serverQueryContent(event)
    .where({
      _locale: locale?.toString(),
      _partial: false,
      _contentType: "blog",
      _source: "content",
      ...(isDraft === null ? { _draft: { $in: [true, false] } } : { _draft: isDraft }),
    })
    .only(["title", "_id", "_path", "slug", "date"])
    .sort({
      date: 1,
    })
    .find();

  const currentIndex = data.findIndex((item) => {
    return item._path === currentPath || item.slug === currentSlug;
  });

  if (currentIndex === -1) {
    return {};
  }

  const nextItem = data[currentIndex + 1];
  const prevItem = data[currentIndex - 1];

  return {
    next: nextItem ?? undefined,
    prev: prevItem ?? undefined,
  };
});
