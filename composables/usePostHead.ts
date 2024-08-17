/* eslint-disable @stylistic/indent */
import type { ExtendedParsedContent } from "~/server/plugins/content";

function makeUrl(url: string, locale: string, defaultLocale: string) {
  if (locale === defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
}

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

export default function (input: ExtendedParsedContent, locales: string[]) {
  const blogConfig = useBlogConfig();
  const config = useRuntimeConfig();
  const route = useRoute();
  const { locale, defaultLocale } = useI18n();
  const localePath = useLocalePath();
  const image = useImage();

  const computedImage = computed(() => {
    if (!input.image) {
      // Use default image
      const optimizedImage = image(blogConfig.value.image, config.public.ipxModifiers);

      return appendBase(optimizedImage, config.public.productionUrl);
    }

    const optimizedImage = image(input.image!, config.public.ipxModifiers);

    return appendBase(optimizedImage, config.public.productionUrl);
  });

  const summary = input.description ?? blogConfig.value.description;

  const postUrl = withBaseUrl(
    makeUrl(`/posts/${input.slug}`, input._locale!, defaultLocale),
    config.public.productionUrl
  );

  const metaTag = [
    {
      name: "description",
      content: summary,
    },
    {
      name: "robots",
      content: "follow, index",
    },
    {
      property: "og:title",
      content: input.title!,
    },
    {
      property: "og:description",
      content: summary,
    },
    {
      property: "og:url",
      content: postUrl,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:site_name",
      content: blogConfig.value.title,
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: input.title!,
    },
    {
      name: "twitter:description",
      content: summary,
    },
  ];

  if (computedImage.value) {
    metaTag.push({
      property: "og:image",
      content: computedImage.value,
    });
    metaTag.push({
      name: "twitter:image",
      content: computedImage.value,
    });
  }

  const pubDate = new Date(input.date!);

  metaTag.push({
    property: "article:published_time",
    content: pubDate.toISOString(),
  });

  if (input.lastmod) {
    metaTag.push({
      property: "article:modified_time",
      content: new Date(input.lastmod).toISOString(),
    });
  }

  const allAuthors = input.authors.map((author) => ({
    "@type": "Person",
    name: author,
  }));

  const featuredImages = computedImage.value
    ? [
        {
          url: computedImage.value,
          alt: input.title!,
        },
      ]
    : [];

  const structuredData = {
    "@context": "http://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    heading: input.title!,
    image: featuredImages,
    datePublished: pubDate.toISOString(),
    dateModified: input.lastmod && new Date(input.lastmod).toISOString(),
    author: allAuthors.length > 1 ? allAuthors : allAuthors[0],
    publisher: {
      "@type": "Organization",
      name: blogConfig.value.title,
      logo: {
        "@type": "ImageObject",
        url: appendBase(blogConfig.value.image, config.public.productionUrl),
      },
    },
    description: summary,
  };

  useHeadSafe({
    htmlAttrs: {
      lang: locale,
    },
    title: input.title!,
    titleTemplate: `%s :: ${blogConfig.value.title}`,
    meta: [
      ...metaTag,
      ...allAuthors.map((author) => ({
        property: "article:author",
        content: author.name,
      })),
      {
        property: "article:tag",
        content: input.tags.join(","),
      },
    ],
    link: [
      {
        rel: "canonical",
        href: postUrl,
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
      ...locales.map((locale) => ({
        rel: "alternate",
        hreflang: locale === defaultLocale ? "x-default" : locale,
        href: withBaseUrl(localePath(route.fullPath, locale), config.public.productionUrl),
      })),
    ],
    script: [
      {
        type: "application/ld+json",
        textContent: JSON.stringify(structuredData),
      },
    ],
  });
}
