<template>
  <div class="my-0 px-4">
    <div
      class="whitespace-pre-wrap break-all rounded-t-md"
      :style="{
        wordWrap: 'break-word',
      }"
    >
      <MDCRenderer v-if="codeAst && codeAst.body" :body="codeAst.body" :data="codeAst.data" />
      <ProsePre v-else unprose code="Currently loading the file...">Currently loading the file...</ProsePre>
    </div>
  </div>
  <div class="rose-pine-surface mx-4 flex flex-row justify-between rounded-b-md px-4 py-3 text-sm">
    <div class="flex flex-row items-center">
      <NuxtLink
        :to="fileUrl"
        class="normal-link font-variable variation-weight-semibold"
        rel="noopener noreferrer"
        target="_blank"
      >
        {{ fileName }}
      </NuxtLink>
      &nbsp;hosted
      <span class="hide-in-phone">&nbsp;with ❤️&nbsp;</span>by&nbsp;
      <NuxtLink
        to="https://github.com"
        class="normal-link font-variable variation-weight-semibold"
        rel="noopener noreferrer"
        target="_blank"
      >
        GitHub
      </NuxtLink>
    </div>
    <div class="flex flex-row">
      <NuxtLink
        :to="rawFileUrl"
        class="font-variation normal-link variation-weight-semibold"
        rel="noopener noreferrer"
        target="_blank"
      >
        view raw
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";
import type { MDCParserResult } from "@nuxtjs/mdc";

const props = withDefaults(
  defineProps<{
    user: string;
    repo: string;
    file: string;
    branch?: string;
    startLine?: number;
    endLine?: number;
    noLines?: boolean;
  }>(),
  {
    branch: "master",
    startLine: 1,
    endLine: undefined,
    noLines: false,
  }
);

const codeAst = ref<MDCParserResult>();

const rawFileUrl = computed(() => {
  return `https://raw.githubusercontent.com/${props.user}/${props.repo}/${props.branch}/${props.file}`;
});
const fileUrl = computed(() => {
  const base = `https://github.com/${props.user}/${props.repo}/blob/${props.branch}/${props.file}`;

  let endLineText = "";

  if (props.startLine && props.endLine && props.startLine > 1 && props.startLine < props.endLine) {
    endLineText = `#L${props.startLine}-L${props.endLine}`;
  } else if (props.startLine && props.startLine > 1) {
    endLineText = `#L${props.startLine}`;
  } else if (props.endLine && props.endLine > 1) {
    endLineText = `#L1-L${props.endLine}`;
  }

  return `${base}${endLineText}`;
});
const fileName = computed(() => {
  const lastPart = props.file.split("/").pop()!;

  if (!["master", "main"].includes(props.branch)) {
    const branchExt = props.branch.length === 40 ? props.branch.slice(0, 8) : props.branch;

    return `${lastPart}@${branchExt}`;
  }

  return lastPart;
});

function guessLanguage() {
  const ext = props.file.split(".").pop();

  return ext;
}

async function parseMarkdown(
  codeContents: string,
  options?: {
    overrideLang?: string;
    startLine?: number;
    endLine?: number;
  }
) {
  const parser = useCodeRenderer();
  const { overrideLang, startLine, endLine } = options ?? {};

  // do cutoff
  if (startLine && endLine && startLine < endLine) {
    const lines = codeContents.split("\n");

    codeContents = lines.slice(startLine - 1, endLine).join("\n");
  } else if (startLine) {
    const lines = codeContents.split("\n");

    codeContents = lines.slice(startLine - 1).join("\n");
  } else if (endLine && endLine > 1) {
    const lines = codeContents.split("\n");

    codeContents = lines.slice(0, endLine).join("\n");
  }

  let headMeta = overrideLang ?? guessLanguage() ?? "";

  if (!props.noLines) {
    headMeta = `${headMeta} lineNumbers`;

    if (props.startLine > 1) {
      headMeta = `${headMeta} startLine=${props.startLine}`;
    }
  }

  const formattedText = `\`\`\`${headMeta} noProse\n${codeContents}\n\`\`\``;

  codeAst.value = await parser(formattedText);
}

onMounted(async () => {
  try {
    const codeContents = await $fetch<string>(
      `https://raw.githubusercontent.com/${props.user}/${props.repo}/${props.branch}/${props.file}`,
      {
        responseType: "text",
      }
    );

    await parseMarkdown(codeContents, {
      startLine: props.startLine,
      endLine: props.endLine,
    });
  } catch (error) {
    if (error instanceof FetchError) {
      await parseMarkdown(`An error occurred while fetching the file.\n${error.statusCode} — ${error.message}`, {
        overrideLang: "",
      });
    } else {
      await parseMarkdown(`An error occurred while fetching the file.\n${error}`, {
        overrideLang: "",
      });
    }
  }
});
</script>

<style scoped lang="postcss">
/* hide content for small device */
@media (max-width: 575.98px) {
  .hide-in-phone {
    display: none;
  }
}
</style>
