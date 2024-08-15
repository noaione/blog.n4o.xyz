<template>
  <button
    class="flex h-6 w-6 flex-col items-center justify-center transition-opacity duration-150 hover:opacity-80"
    @click="toggleDarkLight"
  >
    <Icon :name="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="h-6 w-6" />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

function toggleDarkLight() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
