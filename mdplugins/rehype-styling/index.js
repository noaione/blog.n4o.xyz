import { apStyleTitleCase } from "ap-style-title-case";
import { findAndReplace } from "hast-util-find-and-replace";
import { visit } from "unist-util-visit";

export default function rehypeStyling() {
  return (ast) => {
    findAndReplace(ast, [
      // Copyright symbol
      [/\(c\)/gi, "©"],
      // Registered trademark symbol
      [/\(r\)/gi, "®"],
      // Trademark symbol
      [/\(tm\)/gi, "™"],
      // Paragraph symbol
      [/\(p\)/gi, "§"],
      // Plus-minus symbol
      [/\+-/g, "±"],
      // en-dash (for number ranges)
      [/(\d+)-(\d+)/g, ($0, $1, $2) => `${$1}–${$2}`],
      // the correct interrobang !? -> ?!
      [/!\?/g, "?!"],
    ]);

    visit(
      ast,
      (n) => n.type === "element" && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(n.tagName),
      (node) => {
        const matchIndex = node.children.findIndex((child) => child.type === "text");

        if (matchIndex !== -1) {
          // Title case it

          const textNode = node.children[matchIndex];
          const text = textNode.value;

          node.children[matchIndex].value = apStyleTitleCase(text);
        }
      }
    );

    visit(
      ast,
      (n) => n.type === "text" && n.value.match(/(?<!-)(--)(?!-)/),
      (node, index, parent) => {
        // Replace double dashes with em-dashes
        // But only if they're not shiki code blocks

        // Check parent for shiki code block
        const isCodeBlock = parent.type === "element" && parent.tagName === "code";
        const isSpanBlock = parent.type === "element" && parent.tagName === "span";

        if (isCodeBlock) {
          return;
        }

        if (isSpanBlock) {
          // Check if style has --shiki
          const parentStyle = parent.properties.style;

          if (parentStyle && parentStyle.includes("--shiki")) {
            return;
          }
        }

        // Replace double dashes with em-dashes
        node.value = node.value.replace(/(?<!-)(--)(?!-)/g, "—");
      }
    );
  };
}
