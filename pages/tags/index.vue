<template>
  <div
    class="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0"
  >
    <div class="space-x-2 pb-8 pt-6 md:space-y-5">
      <h1
        class="md:leading-14 font-variable text-3xl leading-9 tracking-normal text-gray-900 variation-weight-extrabold dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl"
      >
        {{ t("nav.tags") }}
      </h1>
    </div>
    <div v-if="sortedTags !== undefined" class="flex max-w-lg flex-wrap">
      <template v-if="Object.keys(sortedTags).length === 0">
        {{ $t("blog.noTags") }}
      </template>
      <div v-for="[tag, slugs] in Object.entries(sortedTags)" :key="tag" class="mb-2 mr-5 mt-2">
        <NuxtLink
          :to="localePath(`/tags/${tag}`)"
          class="group font-variable mb-0.5 text-sm lowercase tracking-tight text-primary-500 decoration-dashed variation-weight-medium"
        >
          <span class="decoration-dashed group-hover:underline">#{{ tag }}</span>
          <span class="text-gray-500 dark:text-gray-400"> ({{ slugs.length }})</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TagsResponse } from "~/server/api/content-tags-count.get";

const { locale, t } = useI18n();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();

const query: Record<string, unknown> = {
  locale: locale.value,
};

if (runtimeConfig.public.productionMode) {
  // Do not show drafts in production
  query.draft = false;
}

const { data: tags } = await useAsyncData(`blog-tags-homebase-${locale.value}`, () =>
  $fetch<TagsResponse>("/api/content-tags-count", {
    method: "GET",
    query: query,
  })
);

const sortedTags = computed(() => {
  const tagar = tags.value?.tags;

  if (tagar !== undefined) {
    const sortedKeys = Object.keys(tagar).sort((a, b) => {
      const countA = tagar[a].length;
      const countB = tagar[b].length;

      return countB - countA;
    });

    return Object.fromEntries(sortedKeys.map((key) => [key, tagar[key]]));
  }
});

useBlogHead({
  title: t("nav.tags"),
  description: t("desc.tagsHome"),
});
</script>
