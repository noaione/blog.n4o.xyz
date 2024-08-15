import { apStyleTitleCase } from "ap-style-title-case";
import { visit } from "unist-util-visit";
import { statSync } from "node:fs";
import { join } from "node:path";
import { MarkdownNode, MarkdownParsedContent, MarkdownRoot, Toc, TocLink } from "@nuxt/content";
import readingTime, { ReadTimeResults } from "reading-time";
import authorLists from "~/data/author.json";
import { extractDateFromFilename } from "../../utils/posts";

function getFileDate(file: string) {
  const stats = statSync(file);

  return {
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

function ensureDateOr(keyData: unknown, fallback: Date) {
  if (keyData instanceof Date) {
    return keyData;
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

function calculateReadingTime(root: MarkdownRoot): ReadTimeResults {
  const allNodes = [] as string[];

  visit(root, "text", (node) => {
    const n = node as MarkdownNode;

    // get value of text node
    allNodes.push(n.value || "");
  });

  const text = allNodes.join(" ");

  return readingTime(text, {
    wordsPerMinute: 200,
  });
}

function validateSingleAuthor(author: string) {
  const match = authorLists.find((a) => a.id === author);

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
    link.text = apStyleTitleCase(link.text);

    if (link.children) {
      link.children = transformTocLinks(link.children);
    }

    return link;
  });
}

interface BeforeParse {
  _id: string;
  body: string;
  date?: string;
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:beforeParse", (file: BeforeParse) => {
    if (file._id.endsWith(".md") && file._id.startsWith("content:")) {
      // Formatted content:LANG:anypath:actualpath
      const splitted = file._id.split(":");
      const path = splitted[splitted.length - 1];

      // check if filename follows the format
      const dateData = extractDateFromFilename(path);

      file.date = dateData.date.toISOString();
    }
  });

  nitroApp.hooks.hook("content:file:afterParse", (file) => {
    if (file._id.endsWith(".md") && file.body && file._source === "content") {
      const splitIds = file._id.split(":");
      const idPrefix = splitIds.slice(0, splitIds.length - 1);
      const pathActual = splitIds[splitIds.length - 1];
      const dateInfo = extractDateFromFilename(pathActual);

      file._id = [...idPrefix, dateInfo.title].join(":");
      file.date = ensureDateOr(file.date, dateInfo.date);

      file.title = file.title ? apStyleTitleCase(file.title) : "Untitled";
      file.slug = dateInfo.title.replace(/\.md$/, "");

      const authors = file.author || file.authors;

      if (!authors) {
        throw new Error(`Author is not defined in ${file._id}`);
      }

      file.authors = validateAuthor(authors);

      if (file._file && file._source) {
        const joinPath = join(file._source, file._file);
        const { created, modified } = getFileDate(joinPath);

        file.date = ensureDateOr(file.date, created);
        file.lastmod = ensureDateOr(file.lastmod, modified);
      }

      file.tags = ensureArrayOfString(file.tags);
      file._draft = file._draft || Boolean(file.draft);
      file._contentType = "blog";

      file.readingTime = calculateReadingTime(file.body);

      // Title case ToC
      if (file.body.toc) {
        file.body.toc.title = file.body.toc.title ? apStyleTitleCase(file.body.toc.title) : "";
        file.body.toc.links = transformTocLinks(file.body.toc.links || []);
      }
    }
  });
});

/**
 * ExtendedParsedContent is a type that extends ParsedContent from nuxt/content
 *
 * It adds additional properties that we need for our blog
 */
export interface ExtendedParsedContent extends MarkdownParsedContent {
  date?: Date;
  lastmod?: Date;
  image?: string;
  tags: string[];
  readingTime: ReadTimeResults;
  _draft: boolean;
  authors: string[];
  slug: string;
  _contentType: "blog";
  /**
   * Excerpt
   */
  excerpt?: MarkdownRoot;
  /**
   * Content body
   */
  body: MarkdownRoot & {
    toc?: Toc;
  };
}

export type FrontMatterData = Pick<
  ExtendedParsedContent,
  "title" | "description" | "image" | "tags" | "date" | "lastmod" | "readingTime"
>;
