<template>
  <h1 :id="id" class="font-variable variation-weight-[800]">
    <a v-if="generate" :href="`#${id}`" class="h-autolink">
      <slot />
    </a>
    <slot v-else />
  </h1>
</template>

<script setup lang="ts">
const props = defineProps<{ id?: string }>();

const { headings } = useRuntimeConfig().public.mdc;
const generate = computed(
  () =>
    props.id &&
    ((typeof headings?.anchorLinks === "boolean" && headings?.anchorLinks === true) ||
      (typeof headings?.anchorLinks === "object" && headings?.anchorLinks?.h1))
);
</script>
