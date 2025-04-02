import { ContentCollectionItem, SQLOperator } from "@nuxt/content";
import { boolToNumNull, castBooleanNull } from "~/utils/query";

/**
 * The response data for the content data event handler.
 *
 * It will return the content data if found, otherwises
 */
export interface ContentDataResponse {
  content?: ContentCollectionItem;
  availableLocales: ("id" | "en" | "ja")[];
}

export interface ContentDataQueryParam {
  locale: string;
  slug: string;
  path?: string;
  draft?: boolean;
}

/**
 * An event handler for getting the requested content data.
 *
 * If it doesn't exist, it will return a possible suggestion
 * in another language if available.
 *
 * If not, then it will throw an error.
 */
export default defineEventHandler(async (event) => {
  const { locale, draft, path, slug } = getQuery(event) || {};
  const config = useRuntimeConfig(event);
  const isDraft = config.public.disableDraft ? false : castBooleanNull(draft?.toString());
  const currentPath = path?.toString();
  const currentSlug = slug?.toString();
  const selLocale = locale?.toString();

  if (!currentPath && !currentSlug) {
    throw createError({
      statusCode: 400,
      message: "Missing `path` or `slug` query parameter",
    });
  }

  if (!selLocale) {
    throw createError({
      statusCode: 400,
      message: "Missing `locale` query parameter",
    });
  }

  const data = await queryCollection(event, "content")
    .where("navigation", "<>", false)
    .where("draft", "IN", isDraft !== null ? [boolToNumNull(isDraft)] : [0, 1])
    .orWhere((q) => q.where("path", "=", currentPath).where("slug", "=", currentSlug))
    .all();

  const selectedItem = data.find((item) => item.locale === selLocale);
  const availableLocales = data.map((item) => item.locale);

  if (selectedItem) {
    return {
      content: selectedItem,
      availableLocales: availableLocales.filter((locale) => locale !== selLocale),
    };
  }

  if (!availableLocales.length) {
    throw createError({
      statusCode: 404,
      message: "Content not found and no available locales detected",
    });
  }

  return {
    availableLocales,
  };
});
