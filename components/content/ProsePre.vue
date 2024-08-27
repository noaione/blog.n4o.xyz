<template>
  <div
    ref="bodyEl"
    class="group relative my-5 [&>pre]:!my-0"
    :class="{
      'shiki-unprose': unprose,
    }"
  >
    <div
      v-if="filename || language === 'mermaid'"
      class="rose-pine-surface flex w-full flex-row items-center justify-between py-2 text-[#575279] dark:text-[#e0def4]"
    >
      <div class="flex flex-row items-center">
        <div class="flex px-1 py-1 pl-4">
          <ProseCodeIcon :language="language" />
        </div>
        <div class="font-variable py-1 pl-1 pr-4 text-sm tracking-tight variation-weight-[550]">
          {{ filename ?? "Mermaid Render" }}
        </div>
      </div>
      <CopyToClipboard unpin @copy="copyToClipboard" />
    </div>
    <pre v-if="language === 'mermaid'" class="mermaid-base !rose-pine-related rounded-t-none p-0">{{ code }}</pre>
    <pre
      v-else
      :class="`font-monaspace-neon shiki-wrapper !rose-pine-related font-variable tracking-normal ${filename ? 'mt-0 rounded-t-none' : 'rounded-t-md'} ${$props.class ?? ''}`"
    ><CopyToClipboard v-if="!filename" @copy="copyToClipboard" /><slot /></pre>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code: string;
    language?: string | null;
    filename?: string | null;
    highlights?: number[];
    meta?: string | null;
    class?: string | null;
    unprose?: boolean;
  }>(),
  {
    code: "",
    language: null,
    filename: null,
    highlights: () => [],
    meta: null,
    class: null,
    unprose: false,
  }
);

const bodyEl = ref<HTMLDivElement>();
const clickedClipboard = ref(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.code);
  clickedClipboard.value = true;
  setTimeout(() => {
    clickedClipboard.value = false;
  }, 2000);
};

onMounted(() => {
  if (bodyEl.value) {
    const preEl = bodyEl.value.querySelector("pre");

    if (preEl) {
      // Check if the pre element has a "not-prose"

      const notProse = preEl.classList.contains("unprose");

      if (notProse) {
        bodyEl.value.classList.add("shiki-unprose");
      }
    }
  }
});
</script>

<style lang="postcss">
.shiki-wrapper code {
  display: inline-block;
  width: 100%;
  min-width: max-content;
}

.shiki-wrapper code .line {
  display: table;
}

.shiki-wrapper {
  /* by default use this color */
  color: #575279;
}

.shiki-unprose {
  margin-bottom: 0px;
}

.dark .shiki-wrapper {
  color: #e0def4;
}

.shiki-wrapper code .line span:last-child {
  @apply mr-4;
}

@supports (font-feature-settings: normal) {
  /* Enable monaspace ligatures */
  .shiki-wrapper code .line span {
    font-feature-settings: "calt", "liga", "ss01", "ss02", "ss03", "ss05", "ss06", "ss07", "ss08";
  }
}

.shiki-line-n::before {
  content: var(--shiki-line-number);
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  color: #575279;
  opacity: 0.6;
}

.dark .shiki-line-n::before {
  color: #e0def4;
}

.shiki span {
  font-variation-settings:
    "wght" var(--shiki-wght),
    "slnt" var(--shiki-slnt);
}

.shiki-wrapper.has-focus-line .line:not(.is-focused) {
  transition:
    filter 0.35s,
    opacity 0.35s;
}

.shiki-wrapper.has-focus-line .line:not(.is-focused) {
  filter: blur(6px);
  opacity: 0.7;
}

.shiki-wrapper.has-focus-line:hover .line:not(.is-focused) {
  filter: blur(0);
  opacity: 1;
}

/* 
  Shiki diff styles
*/
.line.highlight,
.line.diff {
  width: 100%;
}

.line.hidden {
  display: none !important;
}

.line.diff.add {
  background-color: #2869833b;
}

.dark .line.diff.add {
  background-color: #31748f87;
}

.line.diff.add::before {
  content: "+ ";
  margin-left: 0.25rem;
  color: #106d10;
}

.dark .line.diff.add::before {
  color: #b0e4b0;
}

.line.diff.remove {
  opacity: 0.7;
  background-color: #b4637a57;
}

.line.diff.remove::before {
  content: "- ";
  margin-left: 0.25rem;
  color: #9e1919;
}

.dark .line.diff.remove::before {
  color: #feabab;
}

.dark .line.diff.remove {
  opacity: 0.7;
  background-color: #eb6f9273;
}
</style>
