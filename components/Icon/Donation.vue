<template>
  <IconTrakteer v-if="iconKind === 'trakteer'" class="social-icon-donation" />
  <Icon v-else-if="iconKind === 'liberapay'" name="simple-icons:liberapay" class="social-icon-donation" />
  <Icon v-else-if="iconKind === 'gh-sponsors'" name="simple-icons:githubsponsors" class="social-icon-donation" />
  <Icon v-else class="social-icon-donation" name="simple-icons:kofi" />
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string;
}>();

const iconKind = computed(() => {
  if (props.url.includes("trakteer.id")) {
    return "trakteer";
  } else if (props.url.includes("liberapay.com")) {
    return "liberapay";
  } else if (props.url.includes("github.com") && props.url.includes("sponsors")) {
    return "gh-sponsors";
  }

  return "ko-fi";
});
</script>

<style scoped lang="postcss">
.social-icon-donation {
  @apply h-8 w-8 fill-current text-gray-700 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400;
}
</style>
