<template>
  <li class="py-4">
    <article class="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
      <dl class="self-start">
        <PostPublication :published-at="data.date!" />
      </dl>
      <div class="space-y-3 xl:col-span-3">
        <div>
          <h3 class="font-variable mb-2 text-2xl leading-8 tracking-tight variation-weight-bold">
            <div v-if="data.image" class="prose mb-2 dark:prose-invert">
              <ImageWrap :src="data.image" alt="Featured blog post image" class="max-w-full" />
            </div>
            <NuxtLink :to="slugUrl" class="normal-link glow-text-md glow-shadow">
              <span v-if="data.draft">(<span role="img" aria-label="construction sign">🚧</span> Draft)</span>
              {{ data.title }}
            </NuxtLink>
          </h3>
          <div v-if="data.tags.length > 0" class="flex flex-wrap">
            <NuxtLink
              v-for="tag in data.tags"
              :key="tag"
              class="normal-link font-variable mb-0.5 mr-2 text-sm lowercase tracking-tight text-primary-500 variation-weight-medium"
              :href="localePath(`/tags/${tag}`)"
            >
              #{{ tag }}
            </NuxtLink>
          </div>
        </div>
        <div class="prose max-w-none text-gray-500 dark:prose-invert dark:text-gray-400">
          <ContentRenderer v-if="data.excerpt" :value="data.excerpt" />
          <p v-else-if="data.description">{{ data.description }}</p>
          <p v-else class="font-variable variation-weight-medium variation-slant-[-10]">No description</p>
        </div>
        <div v-if="seeMore">
          <NuxtLink :to="slugUrl" class="normal-link font-variable glow-text-md glow-shadow">
            {{ $t("blog.readMore") }} &rarr;
          </NuxtLink>
        </div>
      </div>
    </article>
  </li>
</template>

<script setup lang="ts">
import type { ContentPagedQuery } from "~/server/api/content-paged.get";

const props = defineProps<{
  data: ContentPagedQuery;
  seeMore?: boolean;
}>();

const localePath = useLocalePath();

const slugUrl = computed(() => {
  return localePath(`/posts/${props.data.slug}`);
});
</script>
