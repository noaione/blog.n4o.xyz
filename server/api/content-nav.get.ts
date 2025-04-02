import { boolToNumNull, castBooleanNull } from "~/utils/query";

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

  const data = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .select("id", "path", "slug", "title", "date")
    .order("date", "ASC")
    .all();

  const currentIndex = data.findIndex((item) => {
    return item.path === currentPath || item.slug === currentSlug;
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
