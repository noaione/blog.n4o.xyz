<template>
  <NuxtLink :href="nicerHref" :target="target" class="shadow-gray-800 glow-text dark:shadow-gray-200">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href: string;
    target?: "_blank" | "_parent" | "_self" | "_top" | (string & object) | null;
  }>(),
  {
    href: "",
    target: undefined,
  }
);

const localePath = useLocalePath();
const nicerHref = computed(() => {
  if (props.href.startsWith("/")) {
    return localePath(props.href);
  }

  return props.href;
});
</script>
