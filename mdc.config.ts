import { defineConfig } from "@nuxtjs/mdc/config";
import type { HighlighterOptions, MdcThemeOptions } from "@nuxtjs/mdc";
import remarkHeads from "remark-heads";
import type { ShikiTransformer } from "shiki";
import {
  makeCommentNotationRegex,
  transformerCommentNotationDiff,
  transformerCommentNotationFocus,
  transformerCommentNotationHighlight,
  transformerFontVariable,
  transformerNotProsePosition,
  transformerShikiLineNumbers,
} from "./utils/transformers";
import { visit } from "unist-util-visit";
import type { ElementContent, Element as HastElement, Node as HastNode } from "hast";

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

function rehypeShikiCodeNotationRemover() {
  return (ast: ElementContent) => {
    visit(
      ast,
      (node: HastNode) => {
        if (node.type !== "element") {
          return false;
        }

        const element = node as HastElement;

        return (
          element.tagName === "pre" && typeof element.properties.code === "string" && element.properties.code.length > 0
        );
      },
      (node) => {
        if (node.type !== "element") {
          return;
        }

        const element = node as HastElement;

        if (typeof element.properties.code === "string") {
          defaultTransformers.forEach((transformer) => {
            const matchers = transformer.matchers ?? [];

            if (!matchers.length) {
              return;
            }

            const matcher = makeCommentNotationRegex(matchers);

            const splitLines = (element.properties.code as string).split("\n");
            const newLines = splitLines
              .map((line) => {
                const matchLine = line.match(matcher);

                if (!matchLine) {
                  return line;
                }

                const { groups } = matchLine;

                if (!groups) {
                  return line;
                }

                const { cma, marker, ex } = groups;

                if (!cma || !marker) {
                  return line;
                }

                const cmaIndex = line.indexOf(cma);

                if (cmaIndex === -1) {
                  return line;
                }

                // Remove the line if the comment is just the marker
                if (ex === `:${cmaIndex}`) {
                  return null;
                }

                // Check if start at zero, then just remove the line
                if (cmaIndex === 0) {
                  return null;
                }

                // Remove the comment notation
                return line.slice(0, cmaIndex).trimEnd();
              })
              .filter((line) => line !== null);

            element.properties.code = newLines.join("\n");
          });
        }
      }
    );
  };
}

export default defineConfig({
  shiki: {
    transformers(code, lang, theme, options) {
      return handleShikiTransformers(code, lang, theme, options);
    },
  },
  unified: {
    remark(processor) {
      processor.use(remarkHeads);
    },
    // rehype(processor) {
    //   processor.use(rehypeShikiCodeNotationRemover);
    // },
    post(processor) {
      processor.use(rehypeShikiCodeNotationRemover);
    },
  },
});
