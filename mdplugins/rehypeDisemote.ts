import type { Nodes, Text as TextNode } from "hast";
import { h as hast } from "hastscript";
import { visit } from "unist-util-visit";
import discordEmote from "~/assets/discord-emote.json";

const EmojiRegExp = /:(\+1|[-\w]+):/g;

export default function () {
  return (ast: Nodes) => {
    visit(ast, "text", (node, _, parent) => {
      const emoteSlices = [];

      let start = 0;
      let match: RegExpExecArray | null;
      let position: number;

      EmojiRegExp.lastIndex = 0;
      match = EmojiRegExp.exec(node.value);

      while (match) {
        position = match.index;

        const eIdx = discordEmote.findIndex((emote) => emote.name === match?.[1]);

        if (eIdx !== -1) {
          if (start !== position) {
            emoteSlices.push({
              type: "text",
              value: node.value.slice(start, position),
            } as TextNode);
          }

          const sel = discordEmote[eIdx];
          const shouldInline = match[0].length !== match.input.length;

          const newNode = hast("img", {
            src: sel.url,
            alt: sel.name,
            title: sel.name,
            ariaLabel: `Discord: ${sel.name}`,
            className: `discord-emote ${shouldInline ? "discord-emote-inline" : ""}`,
            "data-is-emote": "true",
            "skip-optimize": "true",
          });

          emoteSlices.push(newNode);
          start = position + match[0].length;
        } else {
          EmojiRegExp.lastIndex = position + 1;
        }

        match = EmojiRegExp.exec(node.value);
      }

      if (emoteSlices.length > 0 && parent) {
        emoteSlices.push({
          type: "text",
          value: node.value.slice(start),
        } as TextNode);

        parent.children = emoteSlices;
      }
    });
  };
}
