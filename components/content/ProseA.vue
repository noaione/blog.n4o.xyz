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
    locale?: "en" | "id" | "ja";
  }>(),
  {
    href: "",
    target: undefined,
    locale: undefined,
  }
);

const { locales } = useI18n();
const localePath = useLocalePath();
const nicerHref = computed(() => {
  if (props.href.startsWith("/")) {
    const overrideLocale = locales.value.map((l) => l.code).includes(props.locale ?? "id") ? props.locale : undefined;

    return localePath(props.href, overrideLocale);
  }

  return props.href;
});
</script>
