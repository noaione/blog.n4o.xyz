import twemoji from "@twemoji/api";
import emojiRegex from "emoji-regex";
import { h } from "hastscript";
import { findAndReplace } from "hast-util-find-and-replace";

const emojiRegexValue = emojiRegex();

/**
 * @typedef {Object} RehypeTwemojiOptions
 *
 * @property {'svg' | 'png'} [format='svg'] - The format of the emoji image.
 * @property {string} [source='https://cdn.jsdelivr.net/gh/twitter/twemoji@latest'] - The source of the emoji image.
 * @property {string[]} [ignored=[]] - The list of emoji characters to be ignored.
 * @property {string[]} [expanded=[]] - The list of characters to be stretched using font-variable.
 */

/**
 * The default options of the rehype plugin.
 *
 * @type {RehypeTwemojiOptions}
 */
const defaultOptions = {
  format: "svg",
  source: "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest",
  ignored: [],
  expanded: [],
};

const expandedCodepoints = [
  0xa9, // ©
  0xae, // ®
  0x2122, // ™
  0x21a9, // ↩
];
const ignoredCodepoints = [];

/**
 * A rehype plugin to replace emoji characters with Twemoji images.
 *
 * @type {import('unified').Plugin<[RehypeTwemojiOptions?], import('hast').Root>}
 */
const rehypeTwemoji = (inputOptions) => (tree) => {
  const { format, source, expanded, ignored } = { ...defaultOptions, ...(inputOptions ?? {}) };

  const mergedExpanded = [...(expanded ?? []), ...expandedCodepoints];
  const mergedIgnored = [...(ignored ?? []), ...ignoredCodepoints];

  findAndReplace(tree, [
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
          "aria-label": `Twitter: ${emoji}`,
          "data-twemoji": "",
          "data-is-emote": true,
        });
      },
    ],
  ]);
};

export default rehypeTwemoji;
