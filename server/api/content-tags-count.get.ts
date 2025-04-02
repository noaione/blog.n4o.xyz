import { boolToNumNull, castBooleanNull } from "~/utils/query";

export interface TagsResponse {
  tags: Record<string, string[]>;
}

export default defineEventHandler(async (event) => {
  const { locale, draft } = getQuery(event) || {};
  const config = useRuntimeConfig(event);
  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());

  const data = await queryCollection(event, "content")
    .where("locale", "=", locale?.toString())
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .select("slug", "tags", "date")
    .order("date", "ASC")
    .all();

  // map tags to an array of slug
  // {
  //  tag1: [slug1, slug2],
  //  tag2: [slug3, slug4]
  // }
  const tags = data.reduce(
    (acc, item) => {
      item.tags.forEach((tag) => {
        if (!acc[tag]) {
          acc[tag] = [];
        }

        acc[tag].push(item.slug);
      });

      return acc;
    },
    {} as Record<string, string[]>
  );

  return {
    tags,
  };
});
