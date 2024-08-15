<template>
  <component :is="imgComponent" v-if="isStandardEmote" :src="refinedSrc" :alt="alt" :width="width" :height="height" />
  <div v-else class="group relative [&>pre]:!my-0">
    <component
      :is="imgComponent"
      :src="refinedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :class="`w-full ${alt ? 'mb-1' : ''}`"
      data-zoomable="1"
    />
    <figcaption
      v-if="alt"
      class="font-variable mt-2 text-center text-[0.9rem] text-gray-700 variation-weight-medium variation-slant-[-10] dark:text-gray-400"
    >
      {{ alt }}
    </figcaption>
  </div>
</template>

<script setup lang="ts">
import { joinURL, withLeadingSlash, withTrailingSlash } from "ufo";
import { resolveComponent, useRuntimeConfig } from "#imports";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    ariaLabel?: string;
  }>(),
  {
    src: "",
    alt: "",
    width: undefined,
    height: undefined,
    ariaLabel: undefined,
  }
);

const isTwemoji = computed(() => {
  return props.src?.includes("gh/jdecked/twemoji");
});
const isStandardEmote = computed(() => {
  if (props.alt.startsWith("Discord Emote:")) {
    return true;
  }

  if (props.ariaLabel?.startsWith("emoticon") || props.ariaLabel?.startsWith("Twitter")) {
    return true;
  }

  return isTwemoji.value;
});
const imgComponent = useRuntimeConfig().public.mdc.useNuxtImage ? resolveComponent("NuxtImg") : "img";

const refinedSrc = computed(() => {
  if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));

    if (_base !== "/" && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src);
    }
  }

  return props.src;
});
</script>

<style scoped lang="postcss">
.controlled-zoom {
  @apply relative;
}
</style>
