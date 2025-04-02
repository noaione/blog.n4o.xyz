import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { dirname } from "node:path";
import { extractDateFromFilename } from "./utils/posts";
import type { LocaleObject } from "@nuxtjs/i18n";

import remarkHeads from "./mdplugins/remarkHeads";
import remarkSubSup from "./mdplugins/remarkSubSup";
import rehypeDisemote from "./mdplugins/rehypeDisemote";
import rehypeStyling from "./mdplugins/rehypeStyling";
import rehypeTwemoji from "./mdplugins/rehypeTwemoji";

function makeMdPluginsPath(pluginName: string) {
  const rootPath = dirname(fileURLToPath(import.meta.url));
  const pluginsPath = join(rootPath, "mdplugins", pluginName);

  return pluginsPath.replace(/\\/g, "/");
}

interface FeaturesConfig {
  spotify?: string;
  literal?: string;
  plausible?: {
    /* Used for Plausible Analytics */
    headData: Record<string, string | boolean>;
    viewApi?: string;
  };
}

const featuresConfig = {
  spotify: "https://naotimes-og.glitch.me/spotify/now",
  literal: "noaione",
  plausible: {
    headData: {
      src: "https://tr.n4o.xyz/js/37a79777T080eR4f52A99e2Ica9619a85a5d.js",
      defer: true,
      async: true,
      "data-domain": "blog.n4o.xyz",
      "data-api": "https://tr.n4o.xyz/magic/18c5dcddMc036A4d1dGb785Iaa2e310238c9",
    },
    viewApi: "https://naotimes-og.glitch.me/psb/hits",
  },
} as FeaturesConfig;

const ipxModifiers = {
  format: "webp",
  quality: "90",
};

const mathMLIgnore = (tag: string) => {
  // math related tags
  const mathTags = [
    "math",
    "maction",
    "annotation",
    "annotation-xml",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mi",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mprescripts",
    "mroot",
    "mrow",
    "ms",
    "semantics",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mspace",
    "mtext",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "msqrt",
    "mstyle",
    "mmultiscripts",
    "mover",
    "mprescripts",
    "msub",
    "msubsup",
    "msup",
    "munder",
    "munderover",
    "mtable",
    "mtd",
    "mtr",
    "maction",
    "annotation",
    "annotation-xml",
    "semantics",
  ];

  return mathTags.includes(tag.toLowerCase());
};

function findAllAvailablePosts(allLocales: LocaleObject[], defaultLocale: string) {
  const rootPath = dirname(fileURLToPath(import.meta.url));
  const contentPath = join(rootPath, "content");

  const allPosts = readdirSync(contentPath, { withFileTypes: true, recursive: true })
    .filter((entry) => !entry.isDirectory())
    .map((entry) => {
      try {
        const data = extractDateFromFilename(entry.name);

        const parentPath = entry.parentPath ?? entry.path;
        const splitParent = parentPath.replaceAll("\\", "/").split("/");
        const locale = splitParent[splitParent.length - 1];

        return {
          locale,
          ...data,
        };
      } catch (e) {
        console.warn("Ignoring file", entry.name, "due to error", e);

        return;
      }
    })
    .filter((entry) => entry !== undefined);

  // Group by post slug
  const groupedPosts = allPosts.reduce(
    (acc, post) => {
      if (!acc[post.title]) {
        acc[post.title] = [];
      }

      acc[post.title].push(post.locale);

      return acc;
    },
    {} as Record<string, string[]>
  );

  // Add all missing locales
  Object.keys(groupedPosts).forEach((post) => {
    const missingOne = allLocales.map((locale) => locale.code).filter((locale) => !groupedPosts[post].includes(locale));

    if (!missingOne.length) {
      return;
    }

    groupedPosts[post].push(...missingOne);
  });

  console.info(`Found ${Object.keys(groupedPosts).length} posts, checking for missing locales`);

  // Create the route
  const routes = Object.entries(groupedPosts)
    .map(([post, locales]) => {
      const slug = post.replace(/\.md$/, "");

      const postsPath = `/posts/${slug}`;

      const allPaths = locales.map((locale) => {
        const localePath = locale === defaultLocale ? "" : `/${locale}`;

        return `${localePath}${postsPath}`;
      });

      return allPaths;
    })
    .flat();

  console.info(`Pre-rendering a total of ${routes.length} posts with all available locales`);

  return routes;
}

const locales: LocaleObject[] = [
  {
    code: "id",
    language: "id-ID",
    name: "Bahasa Indonesia",
    file: "id.json",
  },
  {
    code: "en",
    language: "en-US",
    name: "English",
    file: "en.json",
  },
  {
    code: "ja",
    language: "ja-JP",
    name: "日本語",
    file: "ja.json",
  },
];

const defaultLocale = "id";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@nuxtjs/mdc",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@nuxt/image",
    "vue3-carousel-nuxt",
  ],
  routeRules: {
    "/": { prerender: true },
    "/about": { prerender: true },
    "/_ipx/**": { prerender: true },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        "/sitemap.xml",
        "/sitemap.xsl",
        ...locales.map((locale) => `/sitemap/${locale.code}.xml`),
        ...locales.map((locale) => `/feeds/${locale.code}.xml`),
        ...findAllAvailablePosts(locales, defaultLocale),
      ],
    },
  },
  build: {
    analyze: true,
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["shiki/onig.wasm"],
      },
    },
  },
  app: {
    head: {
      title: "N4O Blog",
      meta: [
        {
          "http-equiv": "x-ua-compatible",
          content: "IE=edge",
        },
        {
          name: "apple-mobile-web-app-title",
          content: "N4O Blog",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "application-name",
          content: "N4O Blog",
        },
        {
          name: "msapplication-TileColor",
          content: "#171717",
        },
        {
          name: "msapplication-TileImage",
          content: "/assets/favicons/mstile-150x150.png",
        },
      ],
      link: [
        {
          rel: "shortcut icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/assets/favicons/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/assets/favicons/android-chrome-512x512.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/assets/favicons/android-chrome-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/assets/favicons/android-chrome-96x96.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/assets/favicons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/assets/favicons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/assets/favicons/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/assets/favicons/android-chrome-192x192.png",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "mask-icon",
          href: "/assets/favicons/safari-pinned-tab.svg",
          color: "#c2410c",
        },
      ],
      script: [...(featuresConfig?.plausible?.headData ? [featuresConfig.plausible.headData] : [])],
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: mathMLIgnore,
    },
  },
  imports: {
    imports: [
      {
        name: "FetchError",
        from: "ofetch",
      },
    ],
    dirs: ["./composables", "./utils", "./mdplugins"],
  },
  runtimeConfig: {
    public: {
      productionMode: process.env.NODE_ENV === "production",
      pagination: {
        posts: 10,
        tags: 5,
      },
      productionUrl: import.meta.env.DOMAIN_URL || "https://blog.n4o.xyz",
      // Force disable draft on dev mode
      disableDraft: import.meta.env.DISABLE_DRAFT === "true" || process.env.NODE_ENV === "production",
      featuresConfig,
      ipxModifiers: ipxModifiers,
    },
    i18n: {
      locales: locales.map((locale) => locale.code),
      defaultLocale,
    },
    // Runtime/build time current directory
    currentDir: dirname(fileURLToPath(import.meta.url)),
  },
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-math": {},
        },
        rehypePlugins: {
          "rehype-katex": {
            output: "mathml",
          },
        },
        toc: {
          depth: 3,
          searchDepth: 3,
        },
        highlight: {
          theme: {
            default: "rose-pine-dawn",
            dark: "rose-pine",
          },
          langs: [
            "json",
            "jsonc",
            "js",
            "ts",
            "html",
            "css",
            "scss",
            "postcss",
            "vue",
            "shell",
            "bash",
            "mdc",
            "mdx",
            "md",
            "yaml",
            "jsx",
            "tsx",
            "c",
            "cpp",
            "rs",
            "rust",
            "python",
            "powershell",
            "diff",
            "bat",
            "prisma",
            "py",
            "python",
          ],
        },
      },
      transformers: ["~/transformers/unfuck-shiki.ts"],
    },
    renderer: {
      anchorLinks: true,
      alias: {
        video: "ProseVideo",
        admonition: "Admonition",
        "repo-card": "RepoCard",
        gist: "Gist",
        asciinema: "Asciinema", // TODO: Fix this later
        "github-code": "GitHubCode",
        keystroke: "Keystroke",
        kbd: "ProseKbd",
        // Force prose pre since sometimes this fails to be used properly
        pre: "ProsePre",
        style: "ProseStyle",
      },
    },
  },
  i18n: {
    strategy: "prefix_except_default",
    baseUrl: import.meta.env.DOMAIN_URL || "http://localhost:4500",
    // Disable, let the user choose the language
    detectBrowserLanguage: false,
    langDir: "locales",
    defaultLocale,
    locales,
  },
  fonts: {
    families: [
      {
        // Main font
        name: "Monaspace Xenon",
        provider: "fontsource",
        weights: ["200", "300", "400", "500", "600", "700", "800"],
      },
      {
        // Codeblock font
        name: "Monaspace Neon",
        provider: "fontsource",
        weights: ["400", "600", "700", "800"],
      },
    ],
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
    storageKey: "blog-color-mode",
  },
  ui: {
    safelistColors: ["fiord", "gray", "white", "black"],
  },
  compatibilityDate: "2024-07-28",
  mdc: {
    remarkPlugins: {
      "remark-headings": {
        // @ts-expect-error wrong typing for some reason
        instance: remarkHeads,
        src: makeMdPluginsPath("remarkHeads.ts"),
      },
      "remark-sub-super": {
        // @ts-expect-error wrong typing for some reason
        instance: remarkSubSup,
        src: makeMdPluginsPath("remarkSubSup.ts"),
      },
    },
    rehypePlugins: {
      "rehype-disemote": {
        // @ts-expect-error wrong typing for some reason
        instance: rehypeDisemote,
        src: makeMdPluginsPath("rehypeDisemote.ts"),
      },
      "rehype-twemoji": {
        // @ts-expect-error wrong typing for some reason
        instance: rehypeTwemoji,
        src: makeMdPluginsPath("rehypeTwemoji.ts"),
      },
      "rehype-styling": {
        // @ts-expect-error wrong typing for some reason
        instance: rehypeStyling,
        src: makeMdPluginsPath("rehypeStyling.ts"),
      },
    },
    components: {
      map: {
        video: "ProseVideo",
        admonition: "Admonition",
        "repo-card": "RepoCard",
        gist: "Gist",
        asciinema: "Asciinema",
        "github-code": "GitHubCode",
        keystroke: "Keystroke",
        kbd: "ProseKbd",
        // Force prose pre since sometimes this fails to be used properly
        pre: "ProsePre",
        style: "ProseStyle",
      },
    },
  },
  hooks: {
    "nitro:config": () => {
      // verify defaultLocale is in locales early
      if (!locales.map((locale) => locale.code).includes(defaultLocale)) {
        throw new Error(`defaultLocale ${defaultLocale} is not in locales`);
      }
    },
    "nitro:build:public-assets": async (nitro) => {
      // Do not run on dev mode
      if (nitro.options.dev) {
        return;
      }

      // Do not run if no public dir (similar behaviour from `copyPublicAssets`)
      if (nitro.options.noPublicDir) {
        return;
      }

      // Get all pregenerated images
      const pregenIpxImages = nitro._prerenderedRoutes?.filter(
        (route) =>
          route.route.startsWith("/_ipx/") &&
          !route.route.startsWith("/_ipx/_/") &&
          route.route.includes("/assets/images/")
      );

      if (pregenIpxImages && pregenIpxImages.length) {
        nitro.logger.info(`Removing original images of ${pregenIpxImages.length} pre-generated IPX images`);

        // Get public output dir
        const nitroPublicDir = nitro.options.output.publicDir;

        // Delete all original images that got pregenerated
        const actualImagesPath = pregenIpxImages.map((route) => {
          // ipx fileName format are '/_ipx/f_webp&q_90/assets/images/kidoworkshop1/img-hero.png'
          // remove '/_ipx/xxxxxx/' part
          const cleanedPath = (route.fileName ?? route.route).replace(/^\/_ipx\/[^/]+\//, "/");

          // Transform into {PUBLID_DIR}/{ACTUAL_PATH}
          return join(nitroPublicDir, cleanedPath);
        });

        for (const path of actualImagesPath) {
          // Delete file
          await rm(path);
        }

        nitro.logger.info(`Deleted ${actualImagesPath.length} from ${nitroPublicDir}`);
      }
    },
  },
  carousel: {
    prefix: "V3",
  },
  image: {
    ipx: {
      modifiers: ipxModifiers,
    },
    ipxStatic: {
      modifiers: ipxModifiers,
    },
    static: {
      modifiers: ipxModifiers,
    },
    providers: {
      none: {
        name: "none",
        provider: "~/providers/img-none.ts",
      },
    },
  },
});
