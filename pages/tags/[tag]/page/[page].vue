<template>
  <PostsListing
    v-if="tagsResponse?.data && tagsResponse.data.length > 0"
    :title="$t('nav.tags')"
    :data="tagsResponse.data"
    :tags="actualTag"
    :pagination="tagsResponse.pagination"
  />
  <PostsListing
    v-else-if="tagsResponse?.data && !tagsResponse.data.length"
    :title="$t('nav.tags')"
    :data="[]"
    :tags="actualTag"
  />
</template>

<script setup lang="ts">
import type { ContentPagedResponse } from "~/server/api/content-paged.get";
import type { ContentTagsPagedQueryParam } from "~/server/api/content-tags.get";

const {
  params: { tag, page },
} = useRoute();
const { locale, t } = useI18n();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const localePath = useLocalePath();

function firstTag(tags: string | string[]) {
  const tagged = typeof tags === "string" ? [tags] : tags;

  return tagged[0];
}

const actualTag = firstTag(tag);
const actualPage = firstTag(page);

const parsedPage = Number.parseInt(actualPage, 10);

const query: ContentTagsPagedQueryParam = {
  locale: locale.value,
  limit: runtimeConfig.public.pagination.tags,
  page: parsedPage,
  tag: actualTag,
};

if (Number.isNaN(parsedPage) || parsedPage < 1) {
  // patch the URL
  router.replace(localePath(`/tags/${actualTag}/page/1`));
  query.page = 1;
}

if (runtimeConfig.public.productionMode) {
  // Do not show drafts in production
  query.draft = false;
}

const { data: tagsResponse } = await useAsyncData(
  `blog-tags-homebase-${locale.value}-${actualTag}-page-${query.page}`,
  () =>
    $fetch<ContentPagedResponse>("/api/content-tags", {
      method: "GET",
      query: query,
    })
);

useBlogHead({
  title: `#${actualTag} — ${t("nav.tagsPaged", [actualPage])}`,
  description: t("desc.tag", { tag: actualTag }),
});
</script>
