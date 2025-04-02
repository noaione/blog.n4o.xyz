<template>
  <div ref="cinema" class="asciinema-wrapper not-prose" :data-asciinema="url" />
</template>

<script setup lang="ts">
import type { AsciinemaPlayer } from "asciinema-player";

const props = defineProps<{
  url: string;
}>();

const cinema = ref<HTMLDivElement>();
const player = ref<AsciinemaPlayer<HTMLDivElement>>();

onMounted(() => {
  watch(
    () => cinema.value,
    (value) => {
      if (value && !player.value) {
        console.log("Creating player for", props.url);
        import("asciinema-player")
          .then((AsciinemaPlayer) => {
            player.value = AsciinemaPlayer.create(props.url, value, {
              preload: true,
              fit: "width",
              idleTimeLimit: 3,
            });
          })
          .catch((error) => {
            console.error("Error loading Asciinema player:", error);
          });
      }
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  if (player.value) {
    console.log("Disposing player for", props.url);

    player.value.dispose();
  }
});
</script>
