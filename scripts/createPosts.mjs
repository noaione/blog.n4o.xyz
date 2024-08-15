// @ts-check

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { consola, createConsola } from "consola";
import slugify from "@sindresorhus/slugify";

const TEMPLATE = `---
title: |
  {{ title }}
description: |
  {{ description }}
author:
{{ authors }}
draft: true
---

Your draft post
`;

const cons = createConsola({
  async prompt(...params) {
    const response = await consola.prompt(...params);

    if (typeof response === "symbol" && response.toString() === "Symbol(clack:cancel)") {
      consola.warn("Operation cancelled by the user.");
      process.exit(10);
    }

    return response;
  },
});
const rootDir = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));

async function askForSlug(originalSlug) {
  while (true) {
    const customSlug = await cons.prompt("Enter a custom slug:", {
      type: "text",
      placeholder: originalSlug,
    });

    // Verify if the slug is valid, no spaces, no special characters, etc
    const lowerSlug = customSlug.toLowerCase();
    const validSlug = slugify(lowerSlug);

    if (customSlug !== validSlug) {
      cons.error("The slug is not valid, please try again.");
      continue;
    }

    return validSlug;
  }
}

/**
 * Read the author.json file and return the list of authors
 * @returns {Promise<string[]>}
 */
async function readAuthors() {
  const authorJsonPath = join(rootDir, "data", "author.json");

  const authorJson = await readFile(authorJsonPath, "utf-8");
  const allAuthors = JSON.parse(authorJson);

  return allAuthors.map((author) => author.id);
}

/**
 * Read the availabel locales and return them as an array
 */
async function readLocales() {
  const localesDir = join(rootDir, "locales");
  const localesAvailable = await readdir(localesDir, { withFileTypes: true });

  return localesAvailable.filter((locale) => !locale.isDirectory()).map((locale) => locale.name.replace(".json", ""));
}

async function main() {
  const availableAuthors = await readAuthors();
  const localesAvailable = await readLocales();

  const selectedLocale = await cons.prompt("Select a locale to create a post for:", {
    type: "select",
    options: localesAvailable,
  });

  const selectedAuthors = await cons.prompt("Select the author(s) for this post:", {
    type: "multiselect",
    options: availableAuthors,
    required: true,
  });

  const title = await cons.prompt("Enter the title of the post:", {
    placeholder: "My awesome post",
  });

  let slug = slugify(title);

  const description = await cons.prompt("Enter the description of the post:", {
    placeholder: "A very interesting post",
  });

  if (!slug.trim().length) {
    // No slug was generated, ask the user for a custom slug
    const customSlug = await askForSlug(slug);

    cons.info(`The slug for this post will be: ${customSlug}`);

    slug = customSlug;
  } else {
    // Ask if the user wants to create a proper slug for this
    cons.info(`The generated slug for this post will be: ${slug}`);

    const useSlug = await cons.prompt("Do you want to use this slug?", {
      type: "confirm",
    });

    if (!useSlug) {
      const customSlug = await askForSlug(slug);

      cons.info(`The slug for this post will be: ${customSlug}`);

      slug = customSlug;
    }
  }

  const newDate = new Date();

  cons.info("Creating post...");
  cons.info("Title:", title);
  cons.info("Slug:", slug);
  cons.info("Locale:", selectedLocale);
  cons.info("Date:", newDate.toISOString());

  const postsDir = join(rootDir, "content", selectedLocale);

  const mappedAuthors = selectedAuthors.map((author) => `  - ${author}`);
  const authors = mappedAuthors.join("\n");

  const postContent = TEMPLATE.replace("{{ title }}", title)
    .replace("{{ description }}", description)
    .replace("{{ authors }}", authors);

  const yyyyMMdd = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;
  const fullPostPath = join(postsDir, `${yyyyMMdd}-${slug}.md`);

  await writeFile(fullPostPath, postContent, "utf-8");

  cons.success("Post created successfully into the file:", fullPostPath);
}

main();
