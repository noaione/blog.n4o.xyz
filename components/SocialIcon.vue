<template>
  <NuxtLink :to="actualLink" class="normal-link text-sm" rel="me noopener noreferrer" target="_blank" :title="alt">
    <span class="sr-only">{{ kind }}</span>
    <template v-if="kind === 'twitter'">
      <Icon v-if="!shiftModifier" name="simple-icons:x" class="social-icon" />
      <Icon v-else name="simple-icons:twitter" class="social-icon" />
    </template>
    <Icon v-else-if="kind === 'github'" name="simple-icons:github" class="social-icon" />
    <Icon v-else-if="kind === 'discord'" name="simple-icons:discord" class="social-icon" />
    <Icon v-else-if="kind === 'misskey'" name="simple-icons:misskey" class="social-icon" />
    <Icon v-else-if="kind === 'email'" name="simple-icons:maildotru" class="social-icon" />
    <Icon v-else-if="kind === 'mastodon'" name="simple-icons:mastodon" class="social-icon" />
    <Icon v-else-if="kind === 'matrix'" name="simple-icons:matrix" class="social-icon" />
    <Icon v-else-if="kind === 'donation'" name="simple-icons:kofi" class="social-icon" />
    <Icon v-else-if="kind === 'rss'" name="simple-icons:rss" class="social-icon" />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  kind: "twitter" | "github" | "discord" | "misskey" | "mastodon" | "matrix" | "donation" | "email" | "rss";
  link: string;
  alt?: string;
}>();

const shiftModifier = useKeyModifier("Shift");

const actualLink = computed(() => {
  if (props.kind === "email") {
    if (props.link.startsWith("mailto:")) {
      return props.link;
    }

    if (props.link.startsWith("b64::")) {
      return `mailto:${atob(props.link.slice(5))}`;
    }

    return `mailto:${props.link}`;
  }

  return props.link;
});
</script>

<style scoped lang="postcss">
.social-icon {
  @apply h-8 w-8 fill-current text-gray-700 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400;
}
</style>
