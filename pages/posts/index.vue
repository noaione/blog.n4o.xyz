<template>
  <PostsListing
    v-if="postsResponse?.data && postsResponse.data.length > 0"
    :title="$t('nav.blog')"
    :data="postsResponse.data"
    :pagination="postsResponse.pagination"
  />
  <PostsListing v-else-if="postsResponse?.data && !postsResponse.data.length" :title="$t('nav.blog')" :data="[]" />
</template>

<script setup lang="ts">
import type { ContentPagedQueryParam, ContentPagedResponse } from "~/server/api/content-paged.get";

const { locale, t } = useI18n();
const blogConfig = useBlogConfig();
const runtimeConfig = useRuntimeConfig();

const query: ContentPagedQueryParam = {
  locale: locale.value,
  limit: runtimeConfig.public.pagination.posts,
  page: 1,
};

if (runtimeConfig.public.disableDraft) {
  // Do not show drafts in production
  query.draft = false;
}

const { data: postsResponse } = await useAsyncData(`v2-blog-posts-homebase-${locale.value}`, () =>
  $fetch<ContentPagedResponse>("/api/content-paged", {
    method: "GET",
    query: query,
  })
);

useBlogHead({
  title: t("nav.blog"),
  description: t("desc.post", { name: blogConfig.value.title }),
});
</script>
