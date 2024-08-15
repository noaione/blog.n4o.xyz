import type { MDCParserResult } from "@nuxtjs/mdc";
import { createMarkdownParser, createShikiHighlighter, rehypeHighlight } from "@nuxtjs/mdc/runtime";
import RosePineDawn from "shiki/themes/rose-pine-dawn.mjs";
import RosePine from "shiki/themes/rose-pine.mjs";

import HtmlLang from "shiki/langs/html.mjs";
import JsLang from "shiki/langs/js.mjs";
import JsonLang from "shiki/langs/json.mjs";
import TsLang from "shiki/langs/ts.mjs";
import CssLang from "shiki/langs/css.mjs";
import YamlLang from "shiki/langs/yaml.mjs";

export default function useCodeRenderer() {
  let parser: Awaited<ReturnType<typeof createMarkdownParser>>;

  const parse = async (markdown: string) => {
    if (!parser) {
      parser = await createMarkdownParser({
        rehype: {
          plugins: {
            highlight: {
              instance: rehypeHighlight,
              options: {
                theme: {
                  default: "rose-pine-dawn",
                  dark: "rose-pine",
                },
                highlighter: createShikiHighlighter({
                  bundledThemes: {
                    "rose-pine-dawn": RosePineDawn,
                    "rose-pine": RosePine,
                  },
                  bundledLangs: {
                    html: HtmlLang,
                    js: JsLang,
                    json: JsonLang,
                    ts: TsLang,
                    css: CssLang,
                    yaml: YamlLang,
                    yml: YamlLang,
                  },
                  getMdcConfigs: async () => {
                    const mdcData = await import("../mdc.config");

                    return [mdcData.default];
                  },
                }),
              },
            },
          },
        },
      });
    }

    return parser(markdown) as MDCParserResult;
  };

  return parse;
}
