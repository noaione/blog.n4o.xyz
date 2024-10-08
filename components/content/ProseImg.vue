<template>
  <img
    v-if="isStandardEmote"
    :src="refinedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :aria-label="ariaLabel"
    class="discord-emote discord-emote-inline"
    loading="lazy"
    decoding="async"
  />
  <div v-else class="group relative [&>pre]:!my-0">
    <ImageWrap
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :aria-label="ariaLabel"
      :skip-optimize="isSkipOptimize"
      :class="`w-full ${alt ? 'mb-1' : ''}`"
      zoomable
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
import { useRuntimeConfig } from "#imports";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    ariaLabel?: string;
    skipOptimize?: string;
    dataIsEmote?: string;
  }>(),
  {
    src: "",
    alt: "",
    width: undefined,
    height: undefined,
    ariaLabel: undefined,
    skipOptimize: "false",
    dataIsEmote: "false",
  }
);

const isSkipOptimize = computed(() => {
  return castBooleanNull(props.skipOptimize) ?? false;
});
const isTwemoji = computed(() => {
  return props.src?.includes("gh/jdecked/twemoji");
});
const isStandardEmote = computed(() => {
  if (castBooleanNull(props.dataIsEmote)) {
    return true;
  }

  if (props.alt.startsWith("Discord Emote:")) {
    return true;
  }

  if (props.ariaLabel?.startsWith("emoticon") || props.ariaLabel?.startsWith("Twitter")) {
    return true;
  }

  return isTwemoji.value;
});

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
