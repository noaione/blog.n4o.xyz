<template>
  <div class="space-y-2 pb-8 pt-6 md:space-y-5">
    <nav class="flex flex-row items-center justify-center text-center lg:justify-between">
      <NuxtLink
        v-if="prevPage !== undefined"
        :to="formatLink(prevPage)"
        class="font-variable text-sm tracking-tight opacity-90 variation-weight-medium"
      >
        <button
          class="normal-link flex flex-row items-center text-gray-900 hover:underline focus:outline-none dark:text-gray-100"
        >
          <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-label="Paginate to Previous Page" />
          <span class="hidden lg:block">
            {{ $t("pagination.prev") }}
          </span>
        </button>
      </NuxtLink>
      <button
        v-else
        class="invisible flex cursor-not-allowed flex-row items-center text-gray-900 disabled:opacity-50 dark:text-gray-100"
        aria-label="Previous Page (Disabled)"
        disabled
      >
        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-label="Paginate to Previous Page" />
        <span class="hidden lg:block">
          {{ $t("pagination.prev") }}
        </span>
      </button>
      <span class="font-variable text-gray-700 variation-weight-semibold dark:text-gray-300">
        {{ `${navigation.page.toLocaleString()} ${$t("navigation.pageOf")} ${navigation.totalPage.toLocaleString()}` }}
      </span>
      <NuxtLink
        v-if="nextPage !== undefined"
        :to="formatLink(nextPage)"
        class="font-variable text-sm tracking-tight opacity-90 variation-weight-medium"
      >
        <button
          class="normal-link flex flex-row items-center text-gray-900 hover:underline focus:outline-none dark:text-gray-100"
        >
          <span class="hidden lg:block">
            {{ $t("pagination.next") }}
          </span>
          <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-label="Paginate to Next Page" />
        </button>
      </NuxtLink>
      <button
        v-else
        class="invisible flex cursor-not-allowed flex-row items-center text-gray-900 disabled:opacity-50 dark:text-gray-100"
        aria-label="Next Page (Disabled)"
        disabled
      >
        <span class="hidden lg:block">
          {{ $t("pagination.next") }}
        </span>
        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-label="Paginate to Next Page" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { ContentPagedResponse } from "~/server/api/content-paged.get";

const props = defineProps<{
  baseUrl: string;
  page: number;
  navigation: ContentPagedResponse["pagination"];
}>();

const { locale } = useI18n();
const localePath = useLocalePath();

const nextPage = computed(() => {
  const next = props.page + 1;

  if (props.navigation.totalPage >= next) {
    return next;
  }
});
const prevPage = computed(() => {
  const prev = props.page - 1;

  if (prev >= 1) {
    return prev;
  }
});

function formatLink(page: number) {
  if (page === 1) {
    return localePath(props.baseUrl, locale.value);
  }

  return localePath(`${props.baseUrl}/page/${page}`, locale.value);
}
</script>
