import twemoji from "@twemoji/api";
import emojiRegex from "emoji-regex";
import { h } from "hastscript";
import { findAndReplace } from "hast-util-find-and-replace";
import type { Nodes } from "hast";

const emojiRegexValue = emojiRegex();

interface RehypeTwemojiOptions {
  format?: "svg" | "png";
  source?: string;
  ignored?: string[];
  expanded?: string[];
}

const defaultOptions = {
  format: "svg",
  source: "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest",
  ignored: [],
  expanded: [],
};
const expandedCodepoints: number[] = [
  0xa9, // ©
  0xae, // ®
  0x2122, // ™
  0x21a9, // ↩
];
const ignoredCodepoints: number[] = [];

export default function (inputOptions?: RehypeTwemojiOptions) {
  return (ast: Nodes) => {
    const { format, source, expanded, ignored } = { ...defaultOptions, ...(inputOptions ?? {}) };

    const mergedExpanded = [...(expanded ?? []), ...expandedCodepoints];
    const mergedIgnored = [...(ignored ?? []), ...ignoredCodepoints];

    findAndReplace(ast, [
      [
        emojiRegexValue,
        (emoji) => {
          // Do not change copyright, reserved, and trademark symbol.
          const codePointEmoji = emoji.codePointAt(0);

          if (mergedIgnored.includes(codePointEmoji)) {
            return emoji;
          }

          if (mergedExpanded.includes(codePointEmoji)) {
            return h(
              "span",
              {
                className: "font-variable variation-width-stretch",
              },
              emoji
            );
          }

          const codePoint = twemoji.convert.toCodePoint(
            emoji.indexOf(String.fromCharCode(0x200d)) < 0 ? emoji.replace(/\uFE0F/g, "") : emoji
          );
          const size = format === "svg" ? "svg" : "72x72";
          const url = `${source}/assets/${size}/${codePoint}.${format}`;

          return h("img", {
            src: url,
            alt: emoji,
            "aria-label": `Twemoji: ${emoji}`,
            "data-is-emote": "true",
            "skip-optimize": "true",
          });
        },
      ],
    ]);
  };
}
