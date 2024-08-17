<template>
  <SpotifyCompactView
    v-if="compact"
    :data="mirrorData"
    :loading="status === 'pending' || status === 'idle'"
    :error="sptfyError?.message"
    :no-skeleton="!firstTime"
    @complete="refreshData"
    @refresh="refreshData"
  />
  <div v-else>
    <div class="pb-4 pt-6">
      <h2
        class="font-variable mb-1 text-xl leading-9 tracking-tight text-gray-900 variation-weight-extrabold dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-[3.5rem]"
      >
        Spotify
      </h2>
      <div v-if="mirrorData?.playing" class="!-mt-0.5 flex flex-row items-center gap-2">
        <ImageWrap class="h-6 w-6" alt="PepeJam" src="https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/3x" />
        <p class="font-variable tracking-tight text-gray-400 variation-weight-medium dark:text-gray-500">
          {{ $t("spotify.playing") }}:
        </p>
      </div>
    </div>
    <SpotifyFullView
      :data="mirrorData"
      :loading="status === 'pending' || status === 'idle'"
      :error="sptfyError?.message"
      :no-skeleton="!firstTime"
      @complete="refreshData"
      @refresh="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  compact?: boolean;
  spotifyUrl: string;
}>();

const mirrorData = ref<SpotifyNowResult>();
const firstTime = ref(true);

const {
  data: sptfyData,
  status,
  error: sptfyError,
  refresh,
  execute,
} = await useAsyncData<SpotifyNowResult>("spotify-now-playing", () => $fetch<SpotifyNowResult>(props.spotifyUrl), {
  immediate: false,
  server: false,
  lazy: true,
});

async function refreshData() {
  if (firstTime.value) {
    return;
  }

  await refresh({
    dedupe: true,
  });

  mirrorData.value = sptfyData.value ?? undefined;
}

onMounted(async () => {
  try {
    await execute({
      dedupe: true,
    });

    if (sptfyData.value) {
      mirrorData.value = sptfyData.value;
    }
  } catch (error) {
    console.error(error);
  } finally {
    firstTime.value = false;
  }
});
</script>
