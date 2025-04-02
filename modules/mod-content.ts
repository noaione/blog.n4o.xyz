import type {
  MarkdownRoot,
  MinimalElement,
  MinimalNode,
  MinimalText,
  MinimalTree,
  ParsedContentFile,
  Toc,
  TocLink,
} from "@nuxt/content";
import { defineNuxtModule } from "nuxt/kit";
import readingTime, { type ReadTimeResults } from "reading-time";
import authorLists from "~/data/author.json";
import titleCase from "../utils/titlecase";
import { visit } from "unist-util-visit";
import { statSync } from "node:fs";
import { extractDateFromFilename } from "../utils/posts";

const supportedLocales = ["en", "id", "ja"] as const;

function getFileDate(file: string) {
  const stats = statSync(file);

  return {
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

function isValidDate(d: unknown): d is Date {
  // @ts-expect-error ts doesn't know that d is a Date
  return d instanceof Date && !isNaN(d);
}

function ensureDateOr(keyData: unknown, fallback: Date) {
  if (keyData instanceof Date) {
    return keyData;
  }
  if (typeof keyData === "string") {
    // try parsing
    const parsedDate = new Date(keyData);
    if (isValidDate(parsedDate)) {
      return parsedDate;
    }
  }

  return fallback;
}

function ensureArrayOfString(keyData: unknown): string[] {
  if (Array.isArray(keyData)) {
    return keyData
      .map((key) => {
        if (typeof key === "string") {
          return key;
        }

        return null;
      })
      .filter((key) => key !== null);
  }

  return [];
}

function trimArrayOfString(keyData: string[]): string[] {
  return keyData.map((key) => key.trim()).filter((key) => key.length > 0);
}

function extractMinimalTreeText(root: MinimalNode[], callback: (leaf: MinimalText) => void) {
  root.forEach((node) => {
    if (typeof node === "string") {
      callback(node);
    } else {
      // This is the minimal element array
      // formatted: [element, attributes, ...MinimalNode[]]
      const [_, __, ...children] = node as MinimalElement;
      extractMinimalTreeText(children, callback);
    }
  });
}

function calculateReadingTime(root: MarkdownRoot | MinimalTree): ReadTimeResults {
  const allNodes = [] as string[];

  if (root.type === "minimal") {
    extractMinimalTreeText(root.value, (node) => {
      // get value of text node
      allNodes.push(node as string);
    });
  } else {
    visit(root, "text", (node) => {
      // get value of text node
      allNodes.push(node.value || "");
    });
  }

  const text = allNodes.join(" ");

  return readingTime(text, {
    wordsPerMinute: 200,
  });
}

function validateSingleAuthor(author: string) {
  const match = authorLists.find((a) => a.id === author.trim());

  if (!match) {
    const availIds = authorLists.map((a) => a.id);

    throw new Error(`Author ID ${author} does not exist, availables: ${availIds.join(", ")}`);
  }
}

function validateAuthor(authors: string | string[]) {
  const authorsArr = Array.isArray(authors) ? authors : [authors];

  authorsArr.forEach((a) => validateSingleAuthor(a));

  // Deduplicate
  const uniqueAuthors = [...new Set(authorsArr)];

  return uniqueAuthors;
}

function transformTocLinks(links: TocLink[]) {
  return links.map((link) => {
    link.text = titleCase(link.text.trim());

    if (link.children) {
      link.children = transformTocLinks(link.children);
    }

    return link;
  });
}

function extractAuthors(metadata: ParsedContentFile): string[] | null {
  if (typeof metadata.author === "string") {
    return [metadata.author];
  }
  if (typeof metadata.authors === "string") {
    return [metadata.authors];
  }
  if (Array.isArray(metadata.author)) {
    return metadata.author;
  }
  if (Array.isArray(metadata.authors)) {
    return metadata.authors;
  }
  if (typeof metadata.meta === "object" && metadata.meta !== null && "author" in metadata.meta) {
    if (typeof metadata.meta.author === "string") {
      return [metadata.meta.author];
    }
    if (Array.isArray(metadata.meta.author)) {
      return metadata.meta.author;
    }
  }
  return null;
}

export default defineNuxtModule({
  setup(resolvedOptions, nuxt) {
    nuxt.hook("content:file:beforeParse", (ctx) => {
      if (ctx.collection.name === "content") {
        const splitted = ctx.file.id.split("/");
        const path = splitted[splitted.length - 1];

        // extract date from filename
        const dateData = extractDateFromFilename(path);
        ctx.file.date = dateData.date.toISOString();
      }

      // Detect locale
      // replace \\ with /
      const directory = ctx.file.dirname!.replace(/\\/g, "/");
      // locale is in the last path
      const locale = directory.split("/").slice(-1)[0];
      if (supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
        ctx.file.locale = locale;
      } else {
        throw new Error(
          `[${ctx.file.id}] Locale ${locale} is not supported, supported locales are: ${supportedLocales.join(", ")}`
        );
      }
    });

    nuxt.hook("content:file:afterParse", (ctx) => {
      if (!ctx.file.locale) {
        throw new Error(`[${ctx.file.id}] Locale is not set`);
      }

      if (ctx.collection.name === "content" && ctx.collection.type === "page") {
        const splitted = ctx.file.id.split("/");
        const path = splitted[splitted.length - 1];

        // extract date from filename
        const dateData = extractDateFromFilename(path);

        ctx.content.title = titleCase((ctx.content.title as string) || "").trim();
        ctx.content.description = ((ctx.content.description as string) || "").trim();
        ctx.content.slug = ctx.content.slug || dateData.title.replace(/\.md$/, "");

        const actualDate = ensureDateOr(ctx.file.date, dateData.date);
        const { created, modified } = getFileDate(ctx.file.path);
        ctx.content.date = ensureDateOr(actualDate, created);
        ctx.content.lastmod = ensureDateOr(ctx.content.lastmod, modified);

        const authors = extractAuthors(ctx.content);
        if (!authors) {
          throw new Error(`[${ctx.file.id}] Author is not defined`);
        }

        ctx.content.authors = validateAuthor(authors);
        try {
          delete ctx.content.author;
        } catch (e) {
          // ignore error
        }
        try {
          // @ts-expect-error stupid
          if (ctx.content.meta?.author) {
            // @ts-expect-error stupid
            delete ctx.content.meta.author;
          }
        } catch (e) {
          // ignore error
        }

        ctx.content.tags = trimArrayOfString(ensureArrayOfString(ctx.content.tags));
        // this will always exist!
        ctx.content.draft = Boolean(ctx.content.draft);

        ctx.content.readingTime = calculateReadingTime(ctx.content.body as MarkdownRoot);

        if ((ctx.content.body as MarkdownRoot).toc) {
          const toc = (ctx.content.body as MarkdownRoot).toc as Toc;
          toc.title = toc.title ? titleCase(toc.title) : "";
          toc.links = transformTocLinks(toc.links || []);
          (ctx.content.body as MarkdownRoot).toc = toc;
        }
      }

      // Set locale
      ctx.content.locale = ctx.file.locale;
    });
  },
});
