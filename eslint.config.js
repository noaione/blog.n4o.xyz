import eslint from "@eslint/js";
import eslintVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import eslintStylistic from "@stylistic/eslint-plugin";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  eslint.configs.recommended,
  {
    rules: {
      quotes: [
        "error",
        "double",
        {
          allowTemplateLiterals: true,
        },
      ],
      semi: [
        "error",
        "always",
        {
          omitLastInOneLineBlock: true,
        },
      ],
      "no-trailing-spaces": "error",
      "comma-dangle": [
        "error",
        {
          arrays: "only-multiline",
          objects: "only-multiline",
          functions: "never",
          imports: "only-multiline",
          exports: "never",
        },
      ],
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],
      "eol-last": ["warn", "always"],
      "no-constant-condition": [
        "error",
        {
          checkLoops: false,
        },
      ],
      "sort-imports": [
        "warn",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "single", "multiple"],
          allowSeparatedGroups: true,
        },
      ],
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "directive",
          next: "*",
        },
        {
          blankLine: "any",
          prev: "directive",
          next: "directive",
        },
        {
          blankLine: "always",
          prev: "import",
          next: "*",
        },
        {
          blankLine: "any",
          prev: "import",
          next: "import",
        },
        {
          blankLine: "always",
          prev: "*",
          next: ["const", "let", "var", "export"],
        },
        {
          blankLine: "always",
          prev: ["const", "let", "var", "export"],
          next: "*",
        },
        {
          blankLine: "any",
          prev: ["const", "let", "var", "export"],
          next: ["const", "let", "var", "export"],
        },
        {
          blankLine: "always",
          prev: "*",
          next: ["if", "class", "for", "do", "while", "switch", "try"],
        },
        {
          blankLine: "always",
          prev: ["if", "class", "for", "do", "while", "switch", "try"],
          next: "*",
        },
        {
          blankLine: "always",
          prev: "*",
          next: "return",
        },
      ],
      "generator-star-spacing": [
        "error",
        {
          before: true,
          after: false,
        },
      ],

      "space-infix-ops": "error",
    },
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...eslintVue.configs["flat/recommended"],
  eslintPluginPrettier,
  {
    files: ["**/*.vue", "*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Taken from vue/eslint-config-typescript
      "no-unsued-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    plugins: {
      "@stylistic": eslintStylistic,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/array-element-newline": ["error", "consistent"],
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-at": "off",
    },
  },
  {
    files: ["**/*.vue", "*.vue"],
    rules: {
      "unicorn/filename-case": "off",
      "vue/max-len": [
        "error",
        {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
          ignoreTemplateLiterals: true,
          ignoreStrings: true,
          ignoreHTMLTextContents: true,
          ignoreHTMLAttributeValues: true,
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
          },
        },
      ],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"],
        },
      ],
      "vue/attributes-order": [
        "error",
        {
          order: [
            "DEFINITION",
            "LIST_RENDERING",
            "CONDITIONALS",
            "RENDER_MODIFIERS",
            "GLOBAL",
            ["UNIQUE", "SLOT"],
            "TWO_WAY_BINDING",
            "OTHER_DIRECTIVES",
            "OTHER_ATTR",
            "EVENTS",
            "CONTENT",
          ],
          alphabetical: false,
        },
      ],
      "vue/multiline-html-element-content-newline": "error",
      "vue/multi-word-component-names": "off",
      "vue/return-in-computed-property": "off",
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
          },
          style: {
            lang: "postcss",
          },
        },
      ],
      "vue/no-v-html": "warn",
      "vue/component-tags-order": [
        "error",
        {
          order: ["template", "script[setup]", "script", "style"],
        },
      ],
      "vue/no-v-text": "error",
    },
  },
  {
    files: ["pages/**/*.vue", "layouts/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    rules: {
      // Turn off formatting, taken from vue/eslint-config-prettier/skip-formatting.js
      "prettier/prettier": "off",
    },
  },
  {
    ignores: ["**/node_modules/", ".git/", ".yarn/**/*", ".nuxt/**/*"],
  }
);
