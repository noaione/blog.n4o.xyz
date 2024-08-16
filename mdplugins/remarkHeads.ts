import { visit } from "unist-util-visit";
import type { Nodes, Text as TextNode } from "mdast";

function extractId(metadata: string): string | undefined {
  const match = metadata.match(/#([\w\-_]+)/);

  return match?.[1];
}

function extractClasses(metadata: string): string[] {
  const match = metadata.matchAll(/\.(?<c>[\w\-_]+)/g);

  return Array.from(match)
    .map((m) => m.groups?.c)
    .filter((c) => c !== undefined)
    .map((c) => `.${c}`);
}

function isNoCase(metadata: string): boolean {
  const regex = /(?<![#.])noCase/;

  return regex.test(metadata);
}

/**
 * A simple transformer that parse ${metaTag} in the heading text and add all the relevant data
 * to the heading node.
 */
export default function () {
  return (ast: Nodes) => {
    visit(ast, "heading", (node) => {
      const matchIndex = node.children.findIndex((child) => child.type === "text" && child.value.match(/\${.*}\s?$/g));

      if (matchIndex !== -1) {
        const textNode = node.children[matchIndex] as TextNode;
        const text = textNode.value;
        const match = text.match(/\${(.*?)}(\s*)?$/);

        const metadata = match?.[1] ?? "";
        const whitespace = match?.[2] ?? "";

        (node.children[matchIndex] as TextNode).value = text.replace(/\${.*}\s?$/, whitespace).trim();

        const idMeta = extractId(metadata);
        const classesMeta = extractClasses(metadata);
        const noCase = isNoCase(metadata);

        node.data = {
          hProperties: {
            ...(idMeta ? { id: idMeta } : {}),
            ...(classesMeta.length > 0 ? { className: classesMeta.join(" ") } : {}),
            ...(noCase ? { dataNoCase: true } : {}),
          },
          ...(node.data ?? {}),
        };
      }
    });
  };
}
