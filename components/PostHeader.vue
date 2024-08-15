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
import { useDayjs } from "#dayjs";
import type { ReadTimeResults } from "reading-time";

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
const dayjs = useDayjs();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const hasViewApi = computed(
  () =>
    runtimeConfig.public.featuresConfig.plausible.viewApi !== undefined &&
    runtimeConfig.public.featuresConfig.plausible.viewApi.trim().length > 0
);

const parsedReadingTime = computed(() => {
  if (props.readingTime) {
    // Parse into "relative time"
    return {
      ...props.readingTime,
      localized: dayjs.duration(props.readingTime.time, "milliseconds").locale(locale.value).humanize(),
    };
  }
});

const { data: pageView, execute } = await useAsyncData(
  `blog-post-views-${props.slug}-${locale.value}-${hasViewApi.value ? "hasView" : "stubInfo"}`,
  () => {
    const url = new URLSearchParams();

    url.append("slug", route.path);
    url.append("siteId", "blog.n4o.xyz");

    if (runtimeConfig.public.featuresConfig.plausible.viewApi) {
      return $fetch<{
        hits: number;
      }>(`${runtimeConfig.public.featuresConfig.plausible.viewApi}?${url.toString()}`);
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
