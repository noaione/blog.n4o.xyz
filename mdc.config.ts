import { defineConfig } from "@nuxtjs/mdc/config";
import type { HighlighterOptions, MdcThemeOptions } from "@nuxtjs/mdc";
import type { ShikiTransformer } from "shiki";
import {
  transformerCommentNotationDiff,
  transformerCommentNotationFocus,
  transformerCommentNotationHighlight,
  transformerFontVariable,
  transformerNotProsePosition,
  transformerShikiLineNumbers,
} from "./utils/transformers";

const defaultTransformers = [
  transformerCommentNotationDiff(),
  transformerCommentNotationFocus(),
  transformerCommentNotationHighlight(),
];

export function handleShikiTransformers(
  code: string,
  lang: string,
  theme: MdcThemeOptions,
  options: Partial<HighlighterOptions>
): ShikiTransformer[] {
  const transformers = [...defaultTransformers, transformerFontVariable()];

  if (typeof options.meta === "string") {
    if (options.meta.match(/\blineNumbers\b/)) {
      const startLine = Number.parseInt(options.meta.match(/\bstartLine=(\d+)\b/)?.[1] ?? "1", 10) ?? 1;
      const parsedStart = Number.isNaN(startLine) ? 1 : startLine;

      transformers.push(transformerShikiLineNumbers({ startLine: parsedStart }));
    }

    if (options.meta.match(/\bnoProse\b/)) {
      transformers.push(transformerNotProsePosition());
    }
  }

  return transformers;
}

export default defineConfig({
  shiki: {
    transformers(code, lang, theme, options) {
      return handleShikiTransformers(code, lang, theme, options);
    },
  },
});
