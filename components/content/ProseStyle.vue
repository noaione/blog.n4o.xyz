<template>
  <div ref="elem" class="hidden" style="display: none"><slot /></div>
</template>

<script setup lang="ts">
const elem = ref<HTMLDivElement>();
const identifier = useId();

onMounted(() => {
  // get the inner HTML of this element and inject it to <head> for <style>
  const style = document.createElement("style");

  style.innerHTML = elem.value?.innerHTML || "";
  style.id = `prose-style-${identifier}`;
  style.dataset.proseStyle = "1";
  document.head.appendChild(style);

  // Then nuke the element to prevent it from being rendered in the DOM
  elem.value?.remove();
});

onUnmounted(() => {
  // remove the style element from <head>
  const style = document.getElementById(`prose-style-${identifier}`);
  if (style) {
    style.remove();
  }
});
</script>

