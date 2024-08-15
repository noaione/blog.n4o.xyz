<template>
  <div ref="cinema" class="asciinema-wrapper not-prose" :data-asciinema="url" />
</template>

<script setup lang="ts">
import * as AsciinemaPlayer from "asciinema-player";

const props = defineProps<{
  url: string;
}>();

const cinema = ref<HTMLDivElement>();
const player = ref<AsciinemaPlayer.AsciinemaPlayer<HTMLDivElement>>();

watch(
  () => cinema.value,
  (value) => {
    if (value && !player.value) {
      console.log("Creating player for", props.url);

      player.value = AsciinemaPlayer.create(props.url, value, {
        preload: true,
        fit: "width",
        idleTimeLimit: 3,
      });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (player.value) {
    console.log("Disposing player for", props.url);

    player.value.dispose();
  }
});
</script>
