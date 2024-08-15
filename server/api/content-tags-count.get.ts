import { serverQueryContent } from "#content/server";
import { castBooleanNull } from "~/utils/query";
import { ExtendedParsedContent } from "../plugins/content";

export interface TagsResponse {
  tags: Record<string, string[]>;
}

export default defineEventHandler(async (event) => {
  const { locale, draft } = getQuery(event) || {};
  const config = useRuntimeConfig(event);
  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());

  const data = await serverQueryContent<ExtendedParsedContent>(event)
    .where({
      _locale: locale?.toString(),
      _partial: false,
      _contentType: "blog",
      _source: "content",
      ...(isDraft === null ? { _draft: { $in: [true, false] } } : { _draft: isDraft }),
    })
    .only(["slug", "tags"])
    .sort({
      date: 1,
    })
    .find();

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
