import { defineTransformer, type MinimalTree } from "@nuxt/content";
import { compressTree, decompressTree } from "@nuxt/content/runtime";
import {
  makeCommentNotationRegex,
  transformerCommentNotationDiff,
  transformerCommentNotationFocus,
  transformerCommentNotationHighlight,
} from "../utils/transformers";
import type { MDCNode, MDCRoot } from "@nuxtjs/mdc";
import { visit } from "unist-util-visit";

const defaultTransformers = [
  transformerCommentNotationDiff(),
  transformerCommentNotationFocus(),
  transformerCommentNotationHighlight(),
];

function transformShikiCodeNotationRemoval(ast: MDCRoot): void {
  visit(
    ast,
    // @ts-expect-error We need to use the type of the node, not the type of the visitor
    (node: MDCNode) => {
      if (node.type !== "element") {
        return false;
      }

      return node.tag === "pre" && typeof node.props?.code === "string";
    },
    (node) => {
      if (node.type !== "element") {
        return;
      }

      if (typeof node.props?.code === "string") {
        defaultTransformers.forEach((transformer) => {
          const matchers = transformer.matchers ?? [];
          if (!matchers.length) {
            return;
          }

          const matcher = makeCommentNotationRegex(matchers);

          const splitLines = (node.props!.code as string).split("\n");
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

          node.props!.code = newLines.join("\n");
        });
      }
    }
  );
}

function transformShikiCodeUnfuckClasses(ast: MDCRoot): void {
  visit(
    ast,
    // @ts-expect-error We need to use the type of the node, not the type of the visitor
    (node: MDCNode) => {
      if (node.type !== "element") {
        return false;
      }

      return node.tag === "span" && typeof node.props?.class === "string" && node.props.class.includes("line,");
    },
    (node) => {
      if (node.type !== "element") {
        return;
      }

      if (typeof node.props?.class !== "string") {
        return;
      }

      // Split the classes by comma
      const classes = node.props.class.split(",");
      node.props!.class = classes.join(" ");
    }
  );
}

export default defineTransformer({
  name: "unfuck-shiki",
  extensions: [".md"],
  transform(content) {
    const decompressContent = decompressTree(content.body as MinimalTree);
    transformShikiCodeNotationRemoval(decompressContent);
    transformShikiCodeUnfuckClasses(decompressContent);
    content.body = {
      ...compressTree(decompressContent),
      // @ts-expect-error stupid
      toc: content.body?.toc,
    };
    return content;
  },
});
