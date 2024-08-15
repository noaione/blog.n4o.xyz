<template>
  <div class="divide-y">
    <div class="space-y-2 pb-8 pt-6 md:space-y-5">
      <p
        v-if="tags"
        class="font-variable text-lg uppercase leading-3 tracking-wider text-gray-600 variation-weight-bold dark:text-gray-400"
      >
        {{ $t("nav.tags") }}
      </p>
      <h1
        class="md:leading-14 font-variable text-3xl font-extrabold leading-9 tracking-tight text-gray-900 variation-weight-bold dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl"
        :class="{
          lowercase: tags,
        }"
      >
        {{ tags ? `#${tags}` : title }}
      </h1>
      <!-- search here -->
      <!-- <div class="relative max-w-lg" /> -->
    </div>
    <ul v-if="data.length > 0">
      <PostsListingContent v-for="post in data" :key="post._id" :data="post" />
    </ul>
    <div v-else class="py-6">
      <h2 class="font-variable mb-2 text-3xl variation-weight-bold">
        {{ tags ? $t("blog.noTags") : $t("blog.noPosts") }}
      </h2>
      <NuxtLink
        :to="tags ? localePath('/tags') : localePath('/')"
        class="normal-link font-variable glow-text-md glow-shadow variation-weight-medium"
      >
        {{ $t("blog.backHome") }}
      </NuxtLink>
    </div>
  </div>
  <PostsPagination v-if="pagination" :navigation="pagination" :base-url="baseUrl" :page="curPage" />
</template>

<script setup lang="ts">
import type { ContentPagedQuery, ContentPagedResponse } from "~/server/api/content-paged.get";

const props = defineProps<{
  data: ContentPagedQuery[];
  title: string;
  tags?: string;
  pagination?: ContentPagedResponse["pagination"];
}>();

const localePath = useLocalePath();
const curPage = ref(props?.pagination?.page ?? 1);

const baseUrl = computed(() => {
  return props.tags ? `/tags/${props.tags}` : "/posts";
});
</script>
