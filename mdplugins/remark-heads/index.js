import { visit } from "unist-util-visit";

export default function remarkHeads() {
  return (ast) => {
    visit(ast, "heading", (node) => {
      // Check text content of heading

      // If heading text contains "|#something|" near the end of the string
      // then remove that part and add an id attribute to the heading

      // Example:
      // # My Heading |#my-heading|
      // becomes
      // <h1 id="my-heading">My Heading</h1>

      const matchIndex = node.children.findIndex((child) => child.type === "text" && child.value.match(/\|#.*\|\s?$/));

      if (matchIndex !== -1) {
        const textNode = node.children[matchIndex];
        const text = textNode.value;
        const match = text.match(/\|#(.*)\|(\s)?$/);

        const id = match[1];
        const whitespace = match[2] || "";

        node.children[matchIndex].value = text.replace(/\|#.*\|\s?$/, whitespace).trim();

        node.data = {
          hProperties: {
            id: id,
          },
          ...(node.data || {}),
        };
      }
    })
  }
}
