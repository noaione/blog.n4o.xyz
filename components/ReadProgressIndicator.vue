<template>
  <Teleport to="body">
    <!-- Lightweight read progress indicator -->
    <div class="fixed top-0 z-[9999] h-1 w-screen">
      <div ref="progressBarEl" class="h-1 bg-primary-500" :style="{ width: '0%' }" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// Progress bar element
const progressBarEl = ref<HTMLElement | null>(null);
// Target element
const element = ref<HTMLElement | null>(null);

const documentHeight = ref(0);

onMounted(async () => {
  // Register element
  element.value = document.querySelector("[data-content-id]");
  await nextTick();

  if (!element.value) {
    return;
  }

  documentHeight.value = element.value?.clientHeight ?? 0;

  const updateProgress = () => {
    const position = window.scrollY / documentHeight.value;
    const clamped = Math.min(1, Math.max(0, position));

    if (progressBarEl.value) {
      progressBarEl.value.style.borderTopRightRadius = clamped !== 1 ? "0.375rem" : "0";
      progressBarEl.value.style.borderBottomRightRadius = clamped !== 1 ? "0.375rem" : "0";
      progressBarEl.value.style.width = `${clamped * 100}%`;
    }
  };

  // Watch for element height
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { height } = entry.contentRect;

      documentHeight.value = height;
    }
  });

  window.addEventListener("scroll", updateProgress);
  window.addEventListener("resize", updateProgress);
  observer.observe(element.value!);

  updateProgress();

  onBeforeUnmount(() => {
    console.log("Unmounting: ReadProgressIndicator");

    window.removeEventListener("scroll", updateProgress);
    window.removeEventListener("resize", updateProgress);
    observer.disconnect();
  });
});
</script>
