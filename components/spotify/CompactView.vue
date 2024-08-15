<template>
  <div class="mt-1 flex flex-row items-start gap-1">
    <Icon name="simple-icons:spotify" class="ml-auto mt-[0.1rem] h-4 w-4 text-[#1ED760]" />
    <div class="flex w-full max-w-full flex-col">
      <p
        v-if="loading && !noSkeleton"
        class="font-variable whitespace-pre-line text-gray-800 variation-weight-medium dark:text-gray-200"
      >
        {{ $t("spotify.loading") }}
      </p>
      <p v-else-if="error" class="font-variable text-gray-800 variation-weight-medium dark:text-gray-200">
        {{ error }}
      </p>
      <template v-else-if="data">
        <p v-if="!data.data" class="font-variable text-gray-800 variation-weight-medium dark:text-gray-200">
          {{ $t("spotify.idle") }}
        </p>
        <template v-else>
          <NuxtLink :to="data.data.url" class="normal-link text-primary-500" rel="noreferrer noopener" target="_blank">
            {{ data.data.artist.map((r) => r.name).join(", ") }} - {{ data.data.title }}
          </NuxtLink>
          <div class="mt-0.5 flex flex-col">
            <div class="font-variable text-gray-800 variation-weight-medium dark:text-gray-200">
              <LightweightTimer
                v-if="data.playing"
                :current="data.data.progress"
                :target="data.data.duration"
                @complete="$emit('complete')"
              />
              <div v-else class="flex items-center">
                <Icon name="heroicons:pause-circle" class="mb-0.5 mr-0.5 size-4" />
                <StaticTimer :current="data.data.progress" :target="data.data.duration" />
              </div>
            </div>
          </div>
        </template>
      </template>
      <p v-else class="font-variable whitespace-pre-line text-gray-800 variation-weight-medium dark:text-gray-200">
        {{ $t("spotify.noData") }}
      </p>
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

const refInterval = ref<NodeJS.Timeout | null>(null);

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
