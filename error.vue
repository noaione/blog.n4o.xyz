<template>
  <main class="font-monaspace-xenon font-variable tracking-tighter">
    <UContainer>
      <BlogHeader />
      <div class="flex flex-col pb-8">
        <div class="mt-4">
          <h2 class="font-variable text-center text-3xl variation-weight-bold">{{ error.statusCode }}</h2>
        </div>
        <div class="mt-4 text-center">
          {{ error.message }}
        </div>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();
</script>
