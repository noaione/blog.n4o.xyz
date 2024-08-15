<template>
  <div class="my-3 flex w-full flex-col">
    <div :class="`adm-${actualType} border-x-2 border-t-2 p-4`">
      <div class="font-variable flex flex-row items-center text-sm tracking-tight variation-weight-[550]">
        <Icon v-if="actualType === 'tip'" name="heroicons:information-circle" class="size-6" />
        <Icon
          v-else-if="actualType === 'note' || actualType === 'important'"
          name="heroicons:exclamation-circle"
          class="size-6"
        />
        <Icon v-else-if="actualType === 'warning'" name="heroicons:exclamation-triangle" class="size-6" />
        <Icon v-else-if="actualType === 'danger'" name="heroicons:shield-exclamation" class="size-6" />
        <span class="font-variable ml-1.5 variation-weight-bold">{{ titleReal }}</span>
      </div>
    </div>
    <hr :class="`not-prose adm-hr-${actualType}`" />
    <div :class="`adm-${actualType} adm-content border-x-2 border-b-2 p-4`">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type AdmonitionType = "info" | "note" | "tip" | "warning" | "danger" | "important";

const props = defineProps<{
  type: AdmonitionType;
  title?: string;
}>();

const defaultTitle = {
  info: "Info",
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  danger: "Danger",
  important: "Important",
} as Record<AdmonitionType, string>;

const actualType = computed(() => {
  const validTypes = ["info", "note", "tip", "warning", "danger", "important"];

  const type = props.type.toLowerCase();

  if (!validTypes.includes(type)) {
    return "note";
  }

  if (type === "info") {
    return "note";
  }

  return type;
});

// @ts-expect-error - TS doesn't like this, but it's fine
const titleReal = computed(() => props.title ?? defaultTitle[actualType.value]);
</script>

<style scoped lang="postcss">
.adm-base {
  @apply border-2 p-4;
}

.adm-content p {
  @apply !my-2;
}

.adm-content > p > strong {
  @apply !text-inherit;
}

.adm-note {
  @apply border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400;
}

.adm-tip {
  @apply border-green-500 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-400;
}

.adm-warning {
  @apply border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-400;
}

.adm-danger {
  @apply border-red-500 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-400;
}

.adm-important {
  @apply border-purple-500 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-400;
}

.adm-hr-note {
  @apply border-blue-500 dark:border-blue-700;
}

.adm-hr-tip {
  @apply border-green-500 dark:border-green-700;
}

.adm-hr-warning {
  @apply border-yellow-500 dark:border-yellow-700;
}

.adm-hr-danger {
  @apply border-red-500 dark:border-red-700;
}

.adm-hr-important {
  @apply border-purple-500 dark:border-purple-700;
}
</style>
