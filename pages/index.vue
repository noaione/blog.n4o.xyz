<template>
  <div class="pb-8">
    <div class="space-y-2 pb-8 pt-6 md:space-y-5">
      <h1
        class="md:leading-14 font-variable text-3xl leading-9 tracking-tight text-gray-900 variation-weight-extrabold dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl"
      >
        {{ $t("blog.latest") }}
      </h1>
      <p class="text-lg leading-7 text-gray-500 dark:text-gray-400">
        {{ $t("desc.latest", { name: blogMeta.title }) }}
      </p>
    </div>
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      <PostsListingContent v-if="multiPost && multiPost.length > 0" :data="multiPost[0]" see-more />
      <p v-else-if="!error" class="mt-2">
        {{ $t("blog.noPosts") }}
      </p>
    </ul>
    <div
      v-if="multiPost && multiPost.length > 1"
      class="font-variable flex justify-end py-4 text-base leading-6 variation-weight-medium"
    >
      <NuxtLink :to="localePath('/posts')" class="normal-link glow-text-md glow-shadow">
        {{ $t("blog.viewAll") }} &rarr;
      </NuxtLink>
    </div>
    <SpotifyNowPlaying
      v-if="runtimeConfig.public.featuresConfig.spotify"
      :spotify-url="runtimeConfig.public.featuresConfig.spotify"
    />
    <LiteralCarousel
      v-if="runtimeConfig.public.featuresConfig.literal"
      :handle="runtimeConfig.public.featuresConfig.literal"
      reading-status="IS_READING"
    />
  </div>
</template>

<script setup lang="ts">
import type { QueryBuilderWhere } from "@nuxt/content";
import type { ContentPagedQuery } from "~/server/api/content-paged.get";

const { locale } = useI18n();
const localePath = useLocalePath();
const blogMeta = useBlogConfig();
const runtimeConfig = useRuntimeConfig();

const query: QueryBuilderWhere = {
  _locale: locale.value,
  _source: "content",
  _contentType: "blog",
};

if (runtimeConfig.public.disableDraft) {
  // Do not show drafts in production
  query._draft = false;
}

const { data: multiPost, error } = await useAsyncData(`home-blog-posts-main-${locale.value}`, () =>
  queryContent<ContentPagedQuery>()
    .where(query)
    .sort({
      date: -1,
    })
    .limit(2)
    .find()
);

useBlogHead({
  noTemplate: true,
});
</script>
