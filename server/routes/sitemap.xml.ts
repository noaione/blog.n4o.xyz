import type { EventHandlerRequest, H3Event } from "h3";
import { toXML } from "to-xml";
import { serverQueryContent } from "#content/server";
import { ExtendedParsedContent } from "../plugins/content";

/**
 * Sitemap handler for generating posts sitemap
 */
export async function queryAllContent(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig(event);
  const draftTags = import.meta.dev ? { _draft: { $in: [true, false] } } : { _draft: false };

  return serverQueryContent<ExtendedParsedContent>(event)
    .where({
      _partial: false,
      _contentType: "blog",
      _source: "content",
      _locale: {
        $in: config.i18n.locales,
      },
      ...draftTags,
    })
    .find();
}

export function makeUrl(url: string, locale: string, defaultLocale: string) {
  if (locale === defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
}

export function withBaseUrl(url: string, baseUrl: string) {
  if (url.startsWith("/")) {
    url = url.slice(1);
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const completeUrl = `${baseUrl}/${url}`;

  // Strip trailing slash from the URL
  return completeUrl.replace(/\/$/, "");
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const xmlData = {
    "?": `xml version="1.0" encoding="UTF-8" standalone="yes"`,
    "!": `XMLDATA`,
    sitemapindex: {
      "@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      sitemap: config.i18n.locales.map((locale) => ({
        loc: withBaseUrl(`/sitemap/${locale}.xml`, config.public.productionUrl),
      })),
    },
  };

  const xml = toXML(xmlData, undefined, 2).replace(
    "<!XMLDATA>",
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'
  );

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");

  return xml;
});
