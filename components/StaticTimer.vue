<template>
  <span>{{ formatTime(current) }}/{{ formatTime(target) }}</span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    current?: number;
    target: number;
  }>(),
  {
    current: 0,
  }
);

function formatTime(duration: number) {
  // Format HH:MM:SS (if hours are present)
  // Format MM:SS (if hours are not present)
  // Format DD:HH:MM:SS (if days are present)
  const djs = getDuration(duration);

  const hhmmss = djs.format("HH:mm:ss");
  const days = djs.asDays();

  if (days >= 1) {
    return `${Math.floor(days)}:${hhmmss}`;
  }

  if (djs.asHours() >= 1) {
    return hhmmss;
  }

  return djs.format("mm:ss");
}
</script>
