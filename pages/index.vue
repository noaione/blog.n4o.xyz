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
const { locale } = useI18n();
const localePath = useLocalePath();
const blogMeta = useBlogConfig();
const runtimeConfig = useRuntimeConfig();

const { data: multiPost, error } = await useAsyncData(`home-blog-posts-main-${locale.value}`, () =>
  queryCollection("content")
    .where("locale", "=", locale.value)
    .where("draft", "IN", runtimeConfig.public.disableDraft ? [0] : [1, 0])
    .order("date", "DESC")
    .limit(2)
    .all()
);

useBlogHead({
  noTemplate: true,
});
</script>
