import type { ElementContent, Element as HastElement, Node as HastNode } from "hast";
import { visit } from "unist-util-visit";

import { makeCommentNotationRegex, type ShikiTransformerExtended } from "../utils/transformers";

interface ShikiCodeNotationOptions {
  transformers: ShikiTransformerExtended[];
}

export default function (inputOptions: ShikiCodeNotationOptions) {
  return (ast: ElementContent) => {
    visit(
      ast,
      (node: HastNode) => {
        if (node.type !== "element") {
          return false;
        }

        const element = node as HastElement;

        return (
          element.tagName === "pre" && typeof element.properties.code === "string" && element.properties.code.length > 0
        );
      },
      (node) => {
        if (node.type !== "element") {
          return;
        }

        const element = node as HastElement;

        if (typeof element.properties.code === "string") {
          inputOptions.transformers.forEach((transformer) => {
            const matchers = transformer.matchers ?? [];

            if (!matchers.length) {
              return;
            }

            const matcher = makeCommentNotationRegex(matchers);

            const splitLines = (element.properties.code as string).split("\n");
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

            element.properties.code = newLines.join("\n");
          });
        }
      }
    );
  };
}
