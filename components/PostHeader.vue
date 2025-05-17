<template>
  <header class="flex flex-col items-center pt-6 xl:pb-6">
    <div v-if="publishedAt" class="space-y-1 text-center">
      <dl class="space-y-10">
        <div class="mb-3">
          <PostPublication :published-at="publishedAt" />
        </div>
      </dl>
    </div>
    <div>
      <h1 class="post-title text-center">{{ title }}</h1>
      <p class="mt-2 flex flex-row items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <template v-if="parsedReadingTime">
          <span :aria-value="parsedReadingTime.time.toString()">
            {{ $t("blog.readTime", [parsedReadingTime.localized]) }}
          </span>
          <span class="mx-1">|</span>
        </template>
        <Icon name="heroicons:eye-20-solid" class="mr-1 inline-block h-4 w-4" aria-label="View Count" />
        <span>{{ $t("blog.viewCount", [views === -1 ? "?" : views.toLocaleString()]) }}</span>
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ReadTimeResults } from "reading-time";
import { getDuration } from "../utils/djsDuration";

const props = withDefaults(
  defineProps<{
    slug: string;
    title?: string;
    readingTime?: ReadTimeResults;
    publishedAt?: Date | string;
  }>(),
  {
    title: "Untitled",
    readingTime: undefined,
    publishedAt: undefined,
  }
);

const views = ref(-1);
const { locale } = useI18n();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const hasViewApi = computed(
  () => typeof runtimeConfig.public.apiHost === "string" && runtimeConfig.public.apiHost.trim().length > 0
);

const statsApiUrl = computed(() => {
  if (typeof runtimeConfig.public.apiHost === "string") {
    try {
      const url = new URL(runtimeConfig.public.apiHost);
      url.pathname = "/stats/hits";
      return url.toString();
    } catch (e) {
      return null;
    }
  }
  return null;
});

const parsedReadingTime = computed(() => {
  if (props.readingTime) {
    // Parse into "relative time"
    return {
      ...props.readingTime,
      localized: getDuration(props.readingTime.time).locale(locale.value).humanize(),
    };
  }
});

const { data: pageView, execute } = await useAsyncData(
  `blog-post-views-${props.slug}-${locale.value}-${statsApiUrl.value ? "hasView" : "stubInfo"}`,
  () => {
    const url = new URLSearchParams();

    url.append("slug", route.path);
    url.append("siteId", "blog.n4o.xyz");

    if (statsApiUrl.value) {
      return $fetch<{
        hits: number;
      }>(`${statsApiUrl.value}?${url.toString()}`);
    } else {
      return Promise.resolve({
        hits: -1,
      });
    }
  },
  {
    immediate: false,
    dedupe: "cancel",
  }
);

onMounted(async () => {
  if (!import.meta.dev) {
    await execute();

    if (pageView.value) {
      views.value = pageView.value.hits;
    }
  }
});
</script>

<style scoped lang="postcss">
.post-title {
  @apply font-variable text-3xl glow-text-md glow-shadow variation-weight-extrabold md:text-4xl md:glow-text-lg;
}
</style>

