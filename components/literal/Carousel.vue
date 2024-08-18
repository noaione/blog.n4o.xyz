<template>
  <div class="mt-6 flex w-full flex-col pt-4">
    <h2
      class="font-variable mb-1 text-xl leading-9 tracking-tight text-gray-900 variation-weight-extrabold dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-[3.5rem]"
    >
      {{ readingHeader }}
    </h2>
    <div class="flex flex-row pb-4 align-middle">
      <LiteralIcon class="h-5 w-5 select-none" />
      <p class="ml-2 mr-1">{{ $t("literal.viewAt") }}</p>
      <NuxtLink
        :to="`https://literal.club/${handle}`"
        class="normal-link font-variable variation-weight-medium"
        rel="noopener noreferrer"
        target="_blank"
      >
        Literal
      </NuxtLink>
    </div>
  </div>
  <V3Carousel
    v-if="status !== 'idle' && status !== 'pending' && literalBooks?.data.booksByReadingStateAndHandle"
    :autoplay="5000"
    :items-to-show="itemsToShow"
    :items-to-scroll="itemsToSlide"
    pause-autoplay-on-hover
    wrap-around
  >
    <V3Slide v-for="book in literalBooks.data.booksByReadingStateAndHandle" :key="`literal-${book.id}`">
      <LiteralBookInfo :book="book" :handle="handle" />
    </V3Slide>

    <template #addons>
      <V3Navigation />
    </template>
  </V3Carousel>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";

const props = defineProps<{
  handle: string;
  readingStatus?: LiteralReadingStatus;
}>();

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const breakCurrent = breakpoints.current();

const itemsToShow = computed(() => {
  if (breakCurrent.value.includes("xl") || breakCurrent.value.includes("2xl")) {
    return 4.5;
  } else if (breakCurrent.value.includes("lg")) {
    return 3.5;
  } else if (breakCurrent.value.includes("md")) {
    return 2.5;
  } else {
    return 1.5;
  }
});

const itemsToSlide = computed(() => {
  const biggest = ["lg", "xl", "2xl"].find((b) => breakCurrent.value.includes(b));
  const medium = ["md"].find((b) => breakCurrent.value.includes(b));

  if (biggest) {
    return 3;
  } else if (medium) {
    return 2;
  } else {
    return 1;
  }
});

const readingHeader = computed(() => {
  const reading = props.readingStatus ?? "IS_READING";

  switch (reading) {
    case "IS_READING": {
      return t("literal.reading");
    }
    case "WANTS_TO_READ": {
      return t("literal.wantToRead");
    }
    case "FINISHED": {
      return t("literal.finished");
    }
    case "DROPPED": {
      return t("literal.dropped");
    }
    default: {
      return t("literal.unknown");
    }
  }
});

const {
  data: literalBooks,
  execute,
  status,
} = await useAsyncData(
  "homepage-literal-club-data",
  () =>
    $fetch<BooksByReadingStateAndHandle>("https://literal.club/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        query: LiteralGraphQLQuery,
        variables: {
          handle: "noaione",
          readingStatus: props.readingStatus ?? "IS_READING",
          limit: 50,
          offset: 0,
        },
      },
    }),
  {
    immediate: false,
  }
);

onMounted(async () => {
  await execute();
});
</script>

<style scoped lang="postcss">
.carousel__slide {
  align-items: flex-start;
}
</style>
