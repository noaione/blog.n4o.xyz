import type { EventHandlerRequest, H3Event } from "h3";
import { join } from "node:path";
import { lstat, readdir } from "node:fs/promises";
import { toXML } from "to-xml";
import { ExtendedParsedContent } from "../../plugins/content";
import { queryAllContent, withBaseUrl } from "../sitemap.xml";

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

async function globVue(baseDir: string) {
  const files = await readdir(baseDir);

  if (!files) {
    return [];
  }

  const vueFiles = [] as string[];

  for (const file of files) {
    const fullPath = join(baseDir, file);
    const stat = await lstat(fullPath);

    if (stat.isDirectory()) {
      vueFiles.push(...(await globVue(fullPath)));
    } else {
      if (file.endsWith(".vue")) {
        vueFiles.push(fullPath);
      }
    }
  }

  const uninclude = ["_layout.vue", "_error.vue", "_404.vue"];

  return vueFiles
    .filter((file) => !uninclude.includes(file))
    .filter((file) => {
      const splitFile = file.replaceAll("\\", "/").split("/");

      const matchBracketStyle = splitFile.findIndex(
        (f) => f.startsWith("[") && (f.endsWith("]") || f.endsWith("].vue"))
      );

      return matchBracketStyle === -1;
    });
}

async function getPagesIndex(event: H3Event<EventHandlerRequest>, lang: string) {
  const config = useRuntimeConfig(event);

  const makeUrl = (url: string, locale: string) => {
    if (locale === config.i18n.defaultLocale) {
      return url;
    }

    return `/${locale}${url}`;
  };

  // Walk though all the routes
  const pagesDir = join(config.currentDir, "pages");

  const files = await globVue(pagesDir);

  // strip the pagesDir
  const routes = files.map((file) => {
    const repl = file
      .replaceAll("\\", "/")
      .replace(pagesDir.replaceAll("\\", "/"), "")
      .replace(".vue", "")
      .replace("/index", "");

    if (repl === "") {
      return "/";
    }

    return repl;
  });

  const data = routes.flatMap((route) => {
    return config.i18n.locales
      .filter((l) => l === lang)
      .map((locale) => ({
        loc: withBaseUrl(makeUrl(route, locale), config.public.productionUrl),
        changefreq: "daily",
        alternatives: config.i18n.locales.map((l) => ({
          hreflang: l === config.i18n.defaultLocale ? "x-default" : l,
          href: withBaseUrl(makeUrl(route, l), config.public.productionUrl),
        })),
      }));
  });

  // sort by loc
  data.sort((a, b) => a.loc.localeCompare(b.loc));

  return data;
}

async function getPostsContents(event: H3Event<EventHandlerRequest>, lang: string) {
  const config = useRuntimeConfig(event);
  const contentList = await queryAllContent(event);

  const makeUrl = (url: string, locale: string) => {
    if (locale === config.i18n.defaultLocale) {
      return url;
    }

    return `/${locale}${url}`;
  };

  console.log(`Generating sitemap for ${contentList.length} posts`);

  const localeToSlugs = contentList.reduce(
    (acc, c) => {
      if (!acc[c._locale!]) {
        acc[c._locale!] = [];
      }

      acc[c._locale!].push(c.slug);

      return acc;
    },
    {} as Record<string, string[]>
  );

  const postsMappings = contentList
    .filter((c) => c._locale === lang)
    .map((c) => {
      return {
        loc: withBaseUrl(makeUrl(`/posts/${c.slug}`, c._locale!), config.public.productionUrl),
        lastmod: c.lastmod,
        changefreq: "monthly",
        images: c.image && [
          {
            loc: c.image,
            caption: c.title!,
          },
        ],
        alternatives: config.i18n.locales
          .filter((l) => {
            return localeToSlugs[l]?.includes(c.slug);
          })
          .map((l) => ({
            hreflang: l === config.i18n.defaultLocale ? "x-default" : l,
            href: withBaseUrl(makeUrl(`/posts/${c.slug}`, l), config.public.productionUrl),
          })),
        news: {
          title: c.title!,
          publication_date: c.date!,
          publication: {
            name: "N4O Blog",
            language: c._locale!,
          },
        },
      };
    });

  // Do pagination mappings per locales
  const localeToPosts = contentList.reduce(
    (acc, c) => {
      if (!acc[c._locale!]) {
        acc[c._locale!] = [];
      }

      acc[c._locale!].push(c);

      return acc;
    },
    {} as Record<string, ExtendedParsedContent[]>
  );

  const postsPerPage = config.public.pagination.posts;

  const paginatedPostsMaps = Object.entries(localeToPosts).flatMap(([locale, posts]) => {
    const totalPages = Math.ceil(posts.length / postsPerPage);

    if (locale !== lang) {
      return [];
    }

    return Array.from({ length: totalPages - 1 }, (_, i) => {
      const page = i + 2;

      return {
        loc: withBaseUrl(makeUrl(`/posts/page/${page}`, locale), config.public.productionUrl),
        changefreq: "daily",
      };
    });
  });

  return [...paginatedPostsMaps, ...postsMappings];
}

async function getTagsContents(event: H3Event<EventHandlerRequest>, lang: string) {
  const config = useRuntimeConfig(event);
  const contentList = await queryAllContent(event);

  const makeUrl = (url: string, locale: string) => {
    if (locale === config.i18n.defaultLocale) {
      return url;
    }

    return `/${locale}${url}`;
  };

  const groupedByLocalesByTags = contentList.reduce(
    (acc, c) => {
      if (!acc[c._locale!]) {
        acc[c._locale!] = {};
      }

      for (const tag of c.tags) {
        if (!acc[c._locale!][tag]) {
          acc[c._locale!][tag] = [];
        }

        acc[c._locale!][tag].push(c);
      }

      return acc;
    },
    {} as Record<string, Record<string, ExtendedParsedContent[]>>
  );

  console.log(`Generating tags sitemap for ${lang} locales`);

  const tagsMappings = Object.entries(groupedByLocalesByTags).flatMap(([locale, tags]) => {
    if (!tags) {
      return [];
    }

    console.log(`.. Generating tags sitemap for ${locale} locale => ${lang}`);

    if (locale !== lang) {
      return [];
    }

    const onlyTags = Object.keys(tags).flatMap((tag) => {
      return {
        loc: withBaseUrl(makeUrl(`/tags/${tag}`, locale), config.public.productionUrl),
        changefreq: "daily",
      };
    });

    const pagedTags = Object.entries(tags).flatMap(([tag, posts]) => {
      const totalPages = Math.ceil(posts.length / config.public.pagination.tags);

      return Array.from({ length: totalPages - 1 }, (_, i) => {
        const page = i + 2;

        return {
          loc: withBaseUrl(makeUrl(`/tags/${tag}/page/${page}`, locale), config.public.productionUrl),
          changefreq: "daily",
        };
      });
    });

    return [...onlyTags, ...pagedTags];
  });

  console.log(`Generated ${tagsMappings.length} tags sitemap for ${lang} locales`);

  return tagsMappings;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const lang = parseLang(
    getRouterParam(event, "lang.xml")?.replace(".xml", ""),
    config.i18n.locales,
    config.i18n.defaultLocale
  );

  console.log(`Generating sitemap for ${lang} locale`);

  const indexMain = await getPagesIndex(event, lang);
  const posts = await getPostsContents(event, lang);
  const tags = await getTagsContents(event, lang);

  const xmlData = {
    "?": `xml version="1.0" encoding="UTF-8"`,
    "!": `XMLDATA`,
    urlset: {
      "@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      url: [...indexMain, ...posts, ...tags],
    },
  };

  const xml = toXML(xmlData, undefined, 2).replace(
    "<!XMLDATA>",
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'
  );

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");

  return xml;
});
