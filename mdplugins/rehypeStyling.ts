import type { Nodes, Text as TextNode } from "hast";
import { findAndReplace } from "hast-util-find-and-replace";
import { visit } from "unist-util-visit";
import titleCase from "../utils/titlecase";

function standardReplacer(ast: Nodes) {
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
}

/**
 * Modify the HAST tree to replace double dashes with em-dashes
 *
 * With the exception of code blocks and spans with --shiki in the style
 * @param ast The HAST tree to modify
 */
function replacerEmDashes(ast: Nodes) {
  // @ts-expect-error fuck you TS
  visit(
    ast,
    (n) => n.type === "text" && (n as TextNode).value.match(/(?<!-)(--)(?!-)/),
    (node, _, parent) => {
      if (node.type === "text" && parent?.type === "element") {
        // Check parent for shiki code block
        if (parent.tagName === "code") {
          return;
        }

        if (parent.tagName === "span" && typeof parent.properties.style === "string") {
          // Check if style has --shiki
          const parentStyle = parent.properties.style;

          if (parentStyle && parentStyle.includes("--shiki")) {
            return;
          }
        }

        // Replace double dashes with em-dashes
        node.value = node.value.replace(/(?<!-)(--)(?!-)/g, "—");
      }
    }
  );
}

function apStyleTitleCaser(ast: Nodes) {
  visit(
    ast,
    // @ts-expect-error h1-h6 are valid tag names
    (n) => n.type === "element" && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(n.tagName),
    (node) => {
      if (node.type === "element" && node.properties.dataNoCase !== true) {
        const matchIndex = node.children.findIndex((child) => child.type === "text");

        if (matchIndex !== -1) {
          // Title case it
          const textNode = node.children[matchIndex] as TextNode;
          const text = textNode.value;

          (node.children[matchIndex] as TextNode).value = titleCase(text);
        }
      }
    }
  );
}

export default function () {
  return (ast: Nodes) => {
    standardReplacer(ast);
    replacerEmDashes(ast);
    apStyleTitleCaser(ast);
  };
}
