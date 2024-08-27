<template>
  <UContainer class="flex min-h-screen flex-col">
    <BlogHeader />
    <slot />
    <footer
      class="mt-auto flex w-full flex-col items-center justify-center border-t border-gray-200 pb-4 dark:border-gray-700"
    >
      <p class="mt-4 text-xs opacity-70">
        <span class="font-variable variation-width-stretch">©</span> {{ currentYearInWIB }} {{ blogMeta.title }} |
        CC-BY-NAI-4.0
      </p>
      <p class="mt-1 text-xs opacity-80">
        <NuxtLink
          class="normal-link tracking-tight glow-text-md glow-shadow variation-width-stretch"
          to="https://github.com/noaione/blog.n4o.xyz"
          rel="noopener noreferrer"
          target="_blank"
        >
          {{ $t("sourceCode") }}
        </NuxtLink>
      </p>
    </footer>
  </UContainer>
</template>

<script setup lang="ts">
const currentYearInWIB = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", year: "numeric" });

const blogMeta = useBlogConfig();
</script>
