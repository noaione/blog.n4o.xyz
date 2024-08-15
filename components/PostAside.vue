<template>
  <div
    class="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:sticky xl:top-0 xl:col-start-1 xl:row-start-2 xl:divide-y"
  >
    <div v-if="tags" class="py-4 xl:py-8">
      <h2
        class="font-variable mt-0.5 text-xs uppercase tracking-wider text-gray-500 variation-weight-semibold dark:text-gray-400"
      >
        {{ $t("nav.tags") }}
      </h2>
      <div class="mt-0.5 flex flex-wrap">
        <NuxtLink
          v-for="tag in tags"
          :key="tag"
          class="normal-link font-variable mb-0.5 mr-2 text-sm lowercase tracking-tight text-primary-500 variation-weight-medium"
          :href="localePath(`/tags/${tag}`)"
        >
          #{{ tag }}
        </NuxtLink>
      </div>
    </div>
    <div v-if="runtimeConfig.public.featuresConfig.spotify" class="py-4 xl:py-8">
      <h2
        class="font-variable mt-0.5 text-xs uppercase tracking-wider text-gray-500 variation-weight-semibold dark:text-gray-400"
      >
        {{ $t("spotify.playing") }}
      </h2>
      <SpotifyNowPlaying :spotify-url="runtimeConfig.public.featuresConfig.spotify" compact />
    </div>
    <div
      v-if="navigation?.next || navigation?.prev"
      class="grid py-4 xl:py-8"
      :class="{
        'aside-navigation-single': !navigation?.next || !navigation?.prev,
        'aside-navigation-double': navigation?.next && navigation?.prev,
      }"
    >
      <div v-if="navigation?.prev">
        <h2
          class="font-variable mb-0.5 text-xs uppercase tracking-wider text-gray-500 variation-weight-semibold dark:text-gray-400"
        >
          {{ $t("blog.prevPost") }}
        </h2>
        <NuxtLink
          class="normal-link font-variable break-words tracking-tight text-primary-500 variation-weight-semibold"
          :href="formatPostLink(navigation?.prev)"
        >
          {{ navigation?.prev.title }}
        </NuxtLink>
      </div>
      <div
        v-if="navigation?.next"
        :class="{
          'text-right xl:text-left': navigation?.prev,
          'text-left': !navigation?.prev,
        }"
      >
        <h2
          class="font-variable mb-0.5 text-xs uppercase tracking-wider text-gray-500 variation-weight-semibold dark:text-gray-400"
        >
          {{ $t("blog.nextPost") }}
        </h2>
        <div>
          <NuxtLink
            class="normal-link font-variable break-words tracking-tight text-primary-500 variation-weight-semibold"
            :href="formatPostLink(navigation?.next)"
          >
            {{ navigation?.next.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="pt-4 xl:pt-8">
      <NuxtLink
        class="group font-variable break-words tracking-tight text-primary-500 variation-weight-semibold"
        :href="localePath('/posts')"
      >
        ← <span class="decoration-dashed group-hover:underline">{{ $t("nav.goBack") }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tags?: string[];
  slug: string;
}>();

const { locale } = useI18n();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();

interface PostAsideNavRequest {
  slug: string;
  locale?: string;
  draft?: boolean;
}

interface PostAsideNav {
  _id: string;
  _path: string;
  title: string;
  slug: string;
}

interface PostAsideNavResponse {
  next?: PostAsideNav;
  prev?: PostAsideNav;
}

const query: PostAsideNavRequest = {
  slug: props.slug,
  locale: locale.value,
};

if (runtimeConfig.public.productionMode) {
  // Do not show drafts in production
  query.draft = false;
}

const { data: navigation } = await useAsyncData(`v2-2-main-navigations-${locale.value}-${props.slug}`, () =>
  $fetch<PostAsideNavResponse>("/api/content-nav", {
    method: "GET",
    query: query,
  })
);

function formatPostLink(post: { slug: string }) {
  // strip YYYY-MM-DD- from the path
  return localePath(`/posts/${post.slug}`);
}
</script>

<style scoped lang="postcss">
.aside-navigation-single {
  @apply grid-cols-1 grid-rows-[1fr] xl:grid-cols-[1fr] xl:grid-rows-1;
}

.aside-navigation-double {
  @apply grid-cols-2 grid-rows-[1fr] gap-x-2 xl:grid-cols-[1fr] xl:grid-rows-2 xl:gap-x-0 xl:gap-y-6;
}
</style>
