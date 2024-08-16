import type { Nodes } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { u } from "unist-builder";

export default function () {
  return (ast: Nodes) => {
    findAndReplace(ast, [
      [
        /\^[^^]+\^/g,
        ($0) => {
          return u("html", `<sup>${$0.slice(1, -1)}</sup>`);
        },
      ],
      [
        /#[^#]+#/g,
        ($1) => {
          return u("html", `<sub>${$1.slice(1, -1)}</sub>`);
        },
      ],
    ]);
  };
}
