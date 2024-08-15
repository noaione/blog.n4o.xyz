<template>
  <div class="flex w-full max-w-80 flex-col items-center p-2 align-bottom">
    <div class="aspect-[3 /4] flex h-full w-full max-w-80 flex-col">
      <NuxtImg v-if="book.cover" :src="book.cover" class="h-full rounded-md" :alt="`${book.title} cover`" />
      <div
        v-else
        class="flex h-96 w-full flex-col items-start justify-between rounded-md bg-gray-200 p-4 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
      >
        <div class="font-variable text-left text-base variation-weight-semibold">{{ book.title }}</div>
        <div class="font-variable ml-auto text-sm variation-weight-medium">
          {{ book.authors.map((a) => a.name).join(", ") }}
        </div>
      </div>
    </div>
    <NuxtLink
      :to="bookUrl"
      rel="noopener noreferrer"
      target="_blank"
      class="normal-link font-variable mt-2 glow-text-sm glow-shadow variation-weight-medium"
    >
      {{ book.title }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  handle: string;
  book: LiteralBook;
}>();

const bookUrl = computed(() => {
  return `https://literal.club/${props.handle}/book/${props.book.slug}`;
});
</script>
