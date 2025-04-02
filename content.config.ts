import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import path from "path";

const SocialMedia = z.object({
  kind: z.enum(["discord", "twitter", "github", "email", "misskey", "matrix", "donation"]),
  link: z.string(),
  /* optional alt */
  alt: z.string().optional(),
});

const SupportedLocales = z.enum(["id", "en", "ja"]);

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        date: z.date().optional(),
        image: z.string().optional(),
        draft: z.boolean(),
        tags: z.array(z.string()),
        authors: z.array(z.string()),
        lastmod: z.date().optional(),
        excerpt: z
          .object({
            type: z.string(),
            children: z.any(),
          })
          .optional(),
        slug: z.string(),
        readingTime: z.object({
          text: z.string(),
          time: z.number(),
          words: z.number(),
          minutes: z.number(),
        }),
        locale: SupportedLocales,
      }),
    }),
    meta: defineCollection({
      type: "data",
      source: {
        prefix: "/data",
        cwd: path.resolve(__dirname, "data"),
        include: "**/config.json",
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        aboutImage: z.string(),
        locale: SupportedLocales,
      }),
    }),
    aboutMeta: defineCollection({
      type: "page",
      source: {
        prefix: "/data",
        cwd: path.resolve(__dirname, "data"),
        include: "**/about.md",
      },
      schema: z.object({
        socialMedia: z.array(SocialMedia),
        locale: SupportedLocales,
      }),
    }),
  },
});
