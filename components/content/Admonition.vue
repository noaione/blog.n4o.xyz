<template>
  <AdmonitionBlock :type="props.type" :title="props.title">
    <ContentSlot :use="$slots.default" unwrap="div" />
  </AdmonitionBlock>
</template>

<script setup lang="ts">
type AdmonitionType = "info" | "note" | "tip" | "warning" | "danger" | "important";

const props = defineProps<{
  type: AdmonitionType;
  title?: string;
}>();
</script>
