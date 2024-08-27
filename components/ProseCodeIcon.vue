<template>
  <!-- Provide icon for ProsePre, depending on the available langs -->
  <Icon v-if="mappedLang === 'js'" name="simple-icons:javascript" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'ts'" name="simple-icons:typescript" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'json'" name="simple-icons:json" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'html'" name="simple-icons:html5" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'css'" name="simple-icons:css3" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'scss'" name="simple-icons:sass" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'postcss'" name="simple-icons:postcss" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'md'" name="simple-icons:markdown" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'mdc'" name="simple-icons:mdx" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'shell'" name="simple-icons:gnubash" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'c'" name="simple-icons:c" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'cpp'" name="simple-icons:cplusplus" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'tsx'" name="simple-icons:react" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'jsx'" name="simple-icons:react" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'vue'" name="simple-icons:vuedotjs" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'yaml'" name="simple-icons:yaml" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'rust'" name="simple-icons:rust" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'python'" name="simple-icons:python" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'powershell'" name="simple-icons:powershell" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'diff'" name="simple-icons:git" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'prisma'" name="simple-icons:prisma" class="h-4 w-4" />
  <Icon v-else-if="mappedLang === 'mermaid'" name="simple-icons:mermaid" class="h-4 w-4" />
</template>

<script setup lang="ts">
const props = defineProps<{
  language?: string | null;
}>();

const mappedLanguages = {
  javascript: "js",
  typescript: "ts",
  json: "json",
  jsonc: "json",
  html: "html",
  css: "css",
  scss: "scss",
  postcss: "postcss",
  markdown: "md",
  bash: "shell",
  batch: "shell",
  zsh: "shell",
  sh: "shell",
  "c++": "cpp",
  cplusplus: "cpp",
  typescriptreact: "tsx",
  javascriptreact: "jsx",
  mdx: "mdc",
  py: "python",
  rs: "rust",
};

type MappedLanguagesTypes = keyof typeof mappedLanguages;

const mappedLang = computed(() => {
  if (props.language) {
    return mappedLanguages[props.language as MappedLanguagesTypes] ?? props.language;
  }
});
</script>
