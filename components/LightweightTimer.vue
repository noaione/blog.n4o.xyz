<template>
  <span ref="spanEl" />
</template>

<script setup lang="ts">
import { useDayjs } from "#dayjs";

const props = withDefaults(
  defineProps<{
    current?: number;
    target: number;
  }>(),
  {
    current: 0,
  }
);

const emits = defineEmits<{
  complete: [];
}>();

const startAt = ref<Date>();
const spanEl = ref<HTMLSpanElement | null>(null);
const dayjs = useDayjs();

function formatTime(duration: number) {
  // Format HH:MM:SS (if hours are present)
  // Format MM:SS (if hours are not present)
  // Format DD:HH:MM:SS (if days are present)
  const djs = dayjs.duration(duration, "milliseconds");

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

// Watch for changes in all props
const unwatchTimer = watch(
  [() => props.current, () => props.target],
  async () => {
    startAt.value = new Date();

    // Wait for the next tick to ensure the span element is mounted
    await nextTick();

    // Interval timer is 500ms to update until we reach the target
    const timer = setInterval(() => {
      if (!spanEl.value) {
        return;
      }

      // current and timer will be in mss
      const current = new Date().getTime() - startAt.value!.getTime() + props.current;
      // To not exceed the target
      const renderCurrent = current > props.target ? props.target : current;

      // Formatted HH:MM:SS/HH:MM:SS (current/total)
      spanEl.value.textContent = `${formatTime(renderCurrent)}/${formatTime(props.target)}`;

      if (current >= props.target) {
        clearInterval(timer);
        emits("complete");
      }
    });

    // Cleanup timer
    onBeforeUnmount(() => {
      clearInterval(timer);
      unwatchTimer();
    });
  },
  { immediate: true }
);
</script>
