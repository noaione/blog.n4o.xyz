/* eslint-disable @stylistic/indent */

function withBaseUrl(url: string, baseUrl: string) {
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

function appendBase(url: string, baseUrl: string) {
  // check if starts with http
  if (url.startsWith("http")) {
    return url;
  }

  return withBaseUrl(url, baseUrl);
}

export default function ({
  title,
  description,
  noTemplate,
}: {
  title?: string;
  description?: string;
  noTemplate?: boolean;
}) {
  const blogConfig = useBlogConfig();
  const config = useRuntimeConfig();
  const route = useRoute();
  const { locale, defaultLocale, locales } = useI18n();
  const localePath = useLocalePath();

  const metaTag = [
    {
      name: "description",
      content: description ?? blogConfig.value.description,
    },
    {
      name: "robots",
      content: "follow, index",
    },
    {
      property: "og:title",
      content: title ?? blogConfig.value.title,
    },
    {
      property: "og:description",
      content: description ?? blogConfig.value.description,
    },
    {
      property: "og:url",
      content: appendBase(route.fullPath, config.public.productionUrl),
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:site_name",
      content: blogConfig.value.title,
    },
    {
      property: "og:image",
      content: appendBase(blogConfig.value.image, config.public.productionUrl),
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: title ?? blogConfig.value.title,
    },
    {
      name: "twitter:description",
      content: description ?? blogConfig.value.description,
    },
    {
      name: "twitter:image",
      content: appendBase(blogConfig.value.image, config.public.productionUrl),
    },
  ];

  useHeadSafe({
    htmlAttrs: {
      lang: locale,
    },
    title: title ?? blogConfig.value.title,
    meta: metaTag,
    link: [
      {
        rel: "canonical",
        href: appendBase(route.fullPath, config.public.productionUrl),
      },
      {
        rel: "sitemap",
        type: "application/xml",
        href: withBaseUrl("/sitemap.xml", config.public.productionUrl),
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: withBaseUrl(`/feeds/${locale.value}.xml`, config.public.productionUrl),
      },
      ...locales.value.map((locale) => ({
        rel: "alternate",
        hreflang: locale.code === defaultLocale ? "x-default" : locale.code,
        href: withBaseUrl(localePath(route.fullPath, locale.code), config.public.productionUrl),
      })),
    ],
    ...(noTemplate
      ? {
          titleTemplate: "%s",
        }
      : {
          titleTemplate: `%s | ${blogConfig.value.title}`,
        }),
  });
}
