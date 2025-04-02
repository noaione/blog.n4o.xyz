import type { EventHandlerRequest, H3Event } from "h3";
import { queryAllContent, withBaseUrl } from "../sitemap.xml";
import { toXML } from "to-xml";

function parseLang(lang: string | undefined, locales: string[], defaultLocale: string) {
  const _lang = lang ?? defaultLocale;

  if (!locales.includes(_lang)) {
    throw createError({
      statusCode: 404,
      message: `Language ${_lang} is not supported, available languages are ${locales.join(", ")}`,
    });
  }

  return _lang;
}

interface SimpleBlogInfo {
  title: string;
  description: string;
}

async function getBlogMeta(event: H3Event<EventHandlerRequest>, lang: string): Promise<SimpleBlogInfo> {
  const data = await queryCollection(event, "meta").where("locale", "=", lang).select("title", "description").first();

  if (!data) {
    throw createError({
      statusCode: 404,
      message: "Blog meta not found",
    });
  }

  return data;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const lang = parseLang(
    getRouterParam(event, "lang.xml")?.replace(".xml", ""),
    config.i18n.locales,
    config.i18n.defaultLocale
  );

  const makeUrl = (url: string, locale: string) => {
    if (locale === config.i18n.defaultLocale) {
      return url;
    }

    return `/${locale}${url}`;
  };

  const contentList = await queryAllContent(event);

  // so people don't scrape
  const blogMeta = await getBlogMeta(event, lang);

  const feed = {
    "?": `xml version="1.0" encoding="UTF-8"`,
    rss: {
      "@version": "2.0",
      "@xmlns:atom": "http://www.w3.org/2005/Atom",
      "@xmlns:media": "http://search.yahoo.com/mrss/",
      "@xmlns:dc": "http://purl.org/dc/elements/1.1/",
      channel: {
        title: blogMeta.title,
        description: blogMeta.description,
        link: config.public.productionUrl,
        language: lang,
        copyright: "(c) 2019-present noaione, CC-BY-NAI-4.0 (https://github.com/noaione/blog.n4o.xyz)",
        lastBuildDate: new Date().toUTCString(),
        generator: "Nuxt Custom Feed Generator by noaione",
        item: contentList
          .filter((content) => content.locale === lang)
          .map((content) => {
            const pubDate = new Date(content.date!);
            const url = withBaseUrl(makeUrl(`/posts/${content.slug}`, lang), config.public.productionUrl);

            return {
              title: content.title,
              description: content.description ?? "No description",
              link: url,
              guid: url,
              pubDate: pubDate.toUTCString(),
              category: content.tags,
              "dc:creator": content.authors.join(", "),
              // add image if available
              ...(content.image && {
                "media:content": {
                  "@url": content.image,
                  "@medium": "image",
                },
                "media:thumbnail": {
                  "@url": content.image,
                },
              }),
            };
          }),
      },
    },
  };

  const xml = toXML(feed, undefined, 2);

  setHeader(event, "Content-Type", "application/xml");

  return xml;
});
