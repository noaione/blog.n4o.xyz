<template>
  <div class="flex w-full max-w-full flex-col">
    <p
      v-if="loading && !noSkeleton"
      class="font-variable whitespace-pre-line text-gray-800 variation-weight-medium dark:text-gray-200"
    >
      <SpotifySkeleton />
    </p>
    <div v-else-if="error" class="flex flex-row items-center gap-2">
      <Icon name="simple-icons:spotify" class="h-5 w-5 text-[#1ED760]" />
      <h3 class="font-variable text-2xl text-gray-800 variation-weight-medium dark:text-gray-200">
        {{ error }}
      </h3>
    </div>
    <template v-else-if="data">
      <div v-if="!data.data" class="flex flex-row items-center gap-2">
        <Icon name="simple-icons:spotify" class="h-5 w-5 text-[#1ED760]" />
        <h3 class="font-variable text-xl text-gray-800 variation-weight-medium dark:text-gray-200">
          {{ $t("spotify.idle") }}
        </h3>
      </div>
      <div v-else class="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <div class="relative">
          <NuxtLink :href="data.data.album.url" rel="noopener noreferrer" target="_blank">
            <div class="spotify-wave absolute bottom-0 left-0 right-0 top-0 rounded-lg border-4 duration-[10s]" />
            <ImageWrap
              class="h-auto w-80 min-w-80 rounded-lg shadow-lg xl:w-96 xl:min-w-96"
              :src="data.data.album.cover"
              :alt="`${data.data.album.name} Album Art`"
            />
          </NuxtLink>
        </div>
        <div class="flex flex-col gap-2 text-center md:text-left">
          <div>
            <NuxtLink
              :to="data.data.url"
              class="normal-link font-variable text-2xl variation-weight-bold md:text-3xl lg:text-4xl"
              rel="noopener noreferrer"
              target="_blank"
            >
              {{ data.data.title }}
            </NuxtLink>
          </div>
          <div class="font-variable text-xl text-gray-600 variation-weight-semibold dark:text-gray-500 md:text-2xl">
            <span class="mr-2">
              <NuxtLink :to="data.data.album.url" class="normal-link" rel="noopener noreferrer" target="_blank">
                {{ data.data.album.name }}
              </NuxtLink>
            </span>
            <span class="mr-2">{{ $t("spotify.byArtist") }}</span>
            <span v-for="(artist, index) in data.data.artist" :key="artist.id">
              <NuxtLink :to="artist.url" class="normal-link" rel="noopener noreferrer" target="_blank">
                {{ artist.name }}
              </NuxtLink>
              <span v-if="index < data.data.artist.length - 1">, </span>
            </span>
          </div>
          <div class="font-variable text-gray-400 variation-weight-light dark:text-gray-500">
            {{ parseDate(data.data.album.date) }}
          </div>
          <div class="font-variable text-gray-400 variation-weight-normal dark:text-gray-500">
            <LightweightTimer
              v-if="data.playing"
              :current="data.data.progress"
              :target="data.data.duration"
              @complete="$emit('complete')"
            />
            <div v-else class="flex items-center">
              <Icon name="heroicons:pause-circle" class="mb-0.5 mr-1 size-6" />
              <StaticTimer :current="data.data.progress" :target="data.data.duration" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="flex flex-row items-center gap-2">
      <Icon name="simple-icons:spotify" class="h-5 w-5 text-[#1ED760]" />
      <h3 class="font-variable text-2xl text-gray-800 variation-weight-medium dark:text-gray-200">
        {{ $t("spotify.noData") }}
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data?: SpotifyNowResult;
  loading?: boolean;
  error?: string;
  noSkeleton?: boolean;
}>();

const emits = defineEmits<{
  complete: [];
  refresh: [];
}>();

const { locale } = useI18n();
const refInterval = ref<NodeJS.Timeout | null>(null);

const dateTemplate: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

function parseDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value, dateTemplate);
}

onMounted(() => {
  refInterval.value = setInterval(() => {
    if (props.data?.data && props.data.playing) {
      return;
    }

    emits("refresh");
  }, 5000);
});

onBeforeUnmount(() => {
  if (refInterval.value) {
    clearInterval(refInterval.value);
  }
});
</script>

<style scoped lang="postcss">
.spotify-wave {
  @apply border-2 md:border-[3px] lg:border-4;
  animation: spotify-wave-ani 5s linear alternate infinite;
}

@keyframes spotify-wave-ani {
  from {
    border-color: #4c98af;
  }
  to {
    border-color: #009688;
  }
}
</style>
