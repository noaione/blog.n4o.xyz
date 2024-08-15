import discordEmote from "./discord-emote.json" assert { type: "json" };
import { visit } from "unist-util-visit";

const EmojiRegExp = /:(\+1|[-\w]+):/g;

// Reexport discordEmote for other plugins
export { discordEmote };

export default function remarkDisEmote() {
  return (ast) => {
    visit(ast, "text", (node, index, parent) => {
      const emoteSlices = [];

      let start = 0;
      /** @type {RegExpExecArray} */
      let match;
      /** @type {number} */
      let position;

      EmojiRegExp.lastIndex = 0;
      match = EmojiRegExp.exec(node.value);

      while (match) {
        position = match.index;

        const eIdx = discordEmote.findIndex((e) => e.name === match[1]);

        if (eIdx !== -1) {
          if (start !== position) {
            emoteSlices.push({
              type: "text",
              value: node.value.slice(start, position),
            });
          }

          const sel = discordEmote[eIdx];
          const shouldInline = match[0].length !== match.input.length;

          const newNode = {
            type: "image",
            url: sel.url,
            alt: `Discord Emote: ${sel.name}`,
            title: sel.name,
            // add class for styling
            data: {
              hProperties: {
                ariaLabel: "emoticon: " + sel.name,
                className: `discord-emote ${shouldInline ? "discord-emote-inline" : ""}`,
              },
            },
          };

          emoteSlices.push(newNode);
          start = position + match[0].length;
        } else {
          EmojiRegExp.lastIndex = position + 1;
        }

        match = EmojiRegExp.exec(node.value);
      }

      if (emoteSlices.length > 0) {
        emoteSlices.push({
          type: "text",
          value: node.value.slice(start),
        });
        parent.children = emoteSlices;
      }
    });
  };
}
