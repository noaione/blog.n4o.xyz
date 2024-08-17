<template>
  <NuxtImg
    :src="refinedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :class="$props.class"
    :aria-label="ariaLabel"
    :provider="skipOptimize ? 'none' : 'ipxStatic'"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    :data-zoomable="zoomable ? 1 : undefined"
  />
</template>

<script setup lang="ts">
import { joinURL, withLeadingSlash, withTrailingSlash } from "ufo";

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    ariaLabel?: string;
    skipOptimize?: boolean;
    zoomable?: boolean;
    class?: string;
    eager?: boolean;
  }>(),
  {
    alt: "",
    width: undefined,
    height: undefined,
    ariaLabel: undefined,
    skipOptimize: false,
    zoomable: false,
    class: "",
    eager: false,
  }
);

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
