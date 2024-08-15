<template>
  <div class="flex w-full flex-col items-center justify-center py-6">
    <h1 class="font-variable text-4xl variation-weight-bold">{{ title ?? "404" }}</h1>
    <p class="font-variable mt-2 text-lg variation-weight-[550]">
      <slot>{{ $t("error.missing") }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>
