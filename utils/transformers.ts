import type { ShikiTransformer, ShikiTransformerContext } from "shiki";
import type { Element as HastElement, Text as HastText } from "hast";

export function transformerShikiLineNumbers(options: { startLine?: number }): ShikiTransformer {
  const startLine = (options.startLine ?? 1) < 1 ? 1 : (options.startLine ?? 1);

  return {
    name: "n4o-blog-nuxt/shiki-line-numbers",
    line(hast, line) {
      const actualLine = line + startLine - 1;

      const currentStyle = hast.properties.style ?? "";
      const newStyle = `${currentStyle};--shiki-line-number: "${actualLine}"`;

      hast.properties.style = newStyle;

      this.addClassToHast(hast, "shiki-line-n");

      return hast;
    },
  };
}

export function transformerFontVariable(): ShikiTransformer {
  return {
    name: "n4o-blog-nuxt/shiki-font-variable",
    span(hast) {
      const currentStyle = (hast.properties.style ?? "") as string;

      // Check if has --shiki-default-font-style or --shiki-dark-font-style
      const italicMatch = currentStyle.match(/--shiki-(default|dark)-font-style:italic/);

      let mergedStyles = currentStyle;

      if (italicMatch) {
        // If it has, add the slnt variable
        mergedStyles = `${mergedStyles};--shiki-slnt:-10`;
      } else {
        // If it doesn't, set it to 0
        mergedStyles = `${mergedStyles};--shiki-slnt:0`;
      }

      const boldMatch = currentStyle.match(/--shiki-(default|dark)-font-weight:bold/);

      if (boldMatch) {
        mergedStyles = `${mergedStyles};--shiki-wght:700`;
      } else {
        mergedStyles = `${mergedStyles};--shiki-wght:400`;
      }

      if (mergedStyles) {
        hast.properties.style = mergedStyles;
      }

      return hast;
    },
  };
}

export function transformerNotProsePosition(): ShikiTransformer {
  return {
    name: "n4o-blog-nuxt/shiki-not-prose-position",
    pre(hast) {
      return this.addClassToHast(hast, "unprose");
    },
  };
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeCommentNotationRegex(matchers: string[]) {
  return new RegExp(
    "\\s*(?<cma>//|/\\*|<!--|#|--)\\s+\\[!code (?<marker>" +
      matchers.map(escapeRegExp).join("|") +
      ")(?<ex>:\\d+)?\\]\\s*(?:\\*/|-->)?"
  );
}

export interface ShikiTransformerExtended extends ShikiTransformer {
  matchers: string[];
}

export function transformerCommentNotation(
  name: string,
  matchers: string[],
  transformer: (
    this: ShikiTransformerContext,
    line: HastElement,
    number: number,
    marker: string,
    markerExtra?: number
  ) => [boolean, HastElement]
): ShikiTransformerExtended {
  const matcher = makeCommentNotationRegex(matchers);

  let storedMarker: [number, string] | undefined;

  return {
    name: `n4o-blog-nuxt/shiki-comment-notation/${name}`,
    matchers,
    line(hast, line) {
      const children = hast.children as HastElement[];

      const mergedLines = children
        .map((child) => {
          if (child.type === "element" && child.tagName === "span") {
            const text = child.children[0] as HastText;

            if (text.type === "text") {
              return text.value;
            }
          }
        })
        .filter((line) => line !== undefined)
        .join("");

      const tryToMatch = mergedLines.match(matcher);

      if (!tryToMatch) {
        if (storedMarker !== undefined) {
          const [lineMark, marker] = storedMarker;
          const [success, transform] = transformer.call(this, hast, line, marker, lineMark);

          if (success) {
            storedMarker = undefined;

            return transform;
          }
        }

        return;
      }

      const { groups } = tryToMatch;

      if (!groups) {
        if (storedMarker !== undefined) {
          const [lineMark, marker] = storedMarker;
          const [success, transform] = transformer.call(this, hast, line, marker, lineMark);

          if (success) {
            storedMarker = undefined;

            return transform;
          }
        }

        return;
      }

      const { cma, marker, ex } = groups;

      if (!cma || !marker) {
        if (storedMarker !== undefined) {
          const [lineMark, marker] = storedMarker;
          const [success, transform] = transformer.call(this, hast, line, marker, lineMark);

          if (success) {
            storedMarker = undefined;

            return transform;
          }
        }

        return;
      }

      // Try to find cma and cmb in the children
      const cmaIndex = children.findIndex((child) => {
        if (child.type === "element" && child.tagName === "span") {
          const text = child.children[0] as HastText;

          const hasItalic = (child.properties.style as string | undefined)?.includes("italic") ?? false;

          if (text.type === "text" && hasItalic) {
            const cmaPre = new RegExp(`^\\s*${escapeRegExp(cma)}`);

            return cmaPre.test(text.value);
          }
        }

        return false;
      });

      if (cmaIndex === -1) {
        return;
      }

      if (ex === `:${cmaIndex}`) {
        return;
      }

      const nextParts = children.slice(cmaIndex + 1);

      // sanity check
      if (!nextParts.length) {
        return;
      }

      const nextPartText =
        `${cma} ` +
        nextParts
          .map((child) => {
            if (child.type === "element" && child.tagName === "span") {
              const text = child.children[0] as HastText;

              if (text.type === "text") {
                return text.value;
              }
            }
          })
          .filter((line) => line !== undefined)
          .join("");

      const matchMap = nextPartText.match(matcher);

      if (!matchMap) {
        return;
      }

      const { groups: matchGroups } = matchMap;

      if (!matchGroups) {
        return;
      }

      const { cma: cmaMatch, marker: markerMatch, ex: extraMatch } = matchGroups;

      if (!cmaMatch || !markerMatch) {
        return;
      }

      const extraNum = extraMatch ? Number.parseInt(extraMatch.slice(1), 10) : undefined;

      if (storedMarker === undefined && extraNum !== undefined) {
        storedMarker = [extraNum, markerMatch];
      }

      // Get all the children before the cmaIndex
      const previousParts = children.slice(0, cmaIndex);

      if (!previousParts.length) {
        // Hide parent element
        this.addClassToHast(hast, "hidden");
        hast.children = [];

        return hast;
      }

      // Sanity check complete, callback time
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, transform] = transformer.call(this, hast, line, markerMatch, extraNum);

      return {
        ...transform,
        children: [...previousParts],
      };
    },
  };
}

export function transformerCommentNotationDiff() {
  const markerMaps = {
    "+++": "diff add",
    "---": "diff remove",
  };

  return transformerCommentNotation("diff", Object.keys(markerMaps), function (line, number, marker, position) {
    if (position !== undefined && position !== number) {
      return [false, line];
    }

    this.addClassToHast(this.pre, "has-diff");

    return [true, this.addClassToHast(line, markerMaps[marker as keyof typeof markerMaps] ?? "diff")];
  });
}

export function transformerCommentNotationHighlight() {
  const markerMaps = {
    highlight: "highlight",
  };

  return transformerCommentNotation("highlight", Object.keys(markerMaps), function (line, number, marker, position) {
    if (position !== undefined && position !== number) {
      return [false, line];
    }

    return [true, this.addClassToHast(line, markerMaps[marker as keyof typeof markerMaps] ?? "")];
  });
}

export function transformerCommentNotationFocus() {
  const markerMaps = {
    focus: "is-focused",
  };

  return transformerCommentNotation("focus", Object.keys(markerMaps), function (line, number, marker, position) {
    if (position !== undefined && position !== number) {
      return [false, line];
    }

    this.addClassToHast(this.pre, "has-focus-line");

    return [true, this.addClassToHast(line, markerMaps[marker as keyof typeof markerMaps] ?? "is-focused")];
  });
}
