<template>
  <div class="mx-auto flex flex-col">
    <video class="my-0" width="auto" height="auto" playsinline controls>
      <source :src="src" :type="mimetype ?? determineMimeType(src)" />
    </video>
    <figcaption
      v-if="alt"
      class="font-variable mt-2 text-center text-[0.9rem] text-gray-700 variation-weight-medium variation-slant-[-10] dark:text-gray-400"
    >
      {{ alt }}
    </figcaption>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt?: string;
  mimetype?: string;
}>();

function determineMimeType(src: string) {
  const extension = src.split(".").pop();

  switch (extension) {
    case "mp4": {
      return "video/mp4";
    }
    case "webm": {
      return "video/webm";
    }
    default: {
      return "video/mp4";
    }
  }
}
</script>
