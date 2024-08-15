<template>
  <div
    v-if="status !== 'pending'"
    class="not-prose my-4 rounded-md border border-gray-100 bg-gray-200 p-4 text-sm leading-normal text-gray-800 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-200"
  >
    <div class="flex flex-row items-center">
      <div class="flex">
        <Icon name="simple-icons:github" class="mr-2 size-3" />
      </div>
      <span class="font-variable variation-weight-semibold">
        <NuxtLink :to="repoData.html_url" class="normal-link glow-text-sm glow-shadow">
          {{ repoData.owner.login }} / {{ repoData.name }}
        </NuxtLink>
      </span>
    </div>
    <div v-if="repoData.fork && repoData.source" class="pt-1 text-xs text-gray-500">
      Forked from
      <NuxtLink :to="repoData.source.html_url" class="normal-link">{{ repoData.source.full_name }}</NuxtLink>
    </div>
    <div class="mb-3 pt-3 text-xs text-gray-500 dark:text-gray-400">
      {{ repoData.description }}
    </div>
    <div class="mr-3 flex text-xs text-gray-500 dark:text-gray-400">
      <div v-if="repoData.language" class="mr-4 gap-2">
        <span
          class="font-variable relative top-[1px] inline-block size-3 rounded-full"
          :style="{
            backgroundColor: parsedColors?.[repoData.language]?.color || '#565656',
          }"
        />
        <span class="ml-1">{{ repoData.language }}</span>
      </div>
      <div v-if="repoData.stargazers_count > 0" class="mx-3 flex flex-row items-center">
        <Icon name="heroicons:star" class="h-4 w-4 text-[#FBCA04]" />
        &nbsp; <span>{{ repoData.stargazers_count.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ColorData {
  color: string;
  url: string;
}

interface MinimalGithubRepo {
  name: string;
  owner: {
    login: string;
  };
  source?: {
    html_url: string;
    full_name: string;
  };
  description: string;
  html_url: string;
  stargazers_count: number;
  forks: number;
  fork: boolean;
  language: string;
}

const props = defineProps<{
  username: string;
  repo: string;
}>();

const { data: githubColors } = await useAsyncData("github-card-colors", () =>
  $fetch<string>("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")
);

const parsedColors = computed(() => {
  if (githubColors.value) {
    return JSON.parse(githubColors.value) as Record<string, ColorData>;
  }

  return {};
});

const {
  data: ghData,
  status,
  refresh,
} = await useAsyncData(
  `gh-info-${props.username}-${props.repo}`,
  () => $fetch<MinimalGithubRepo>(`https://api.github.com/repos/${props.username}/${props.repo}`),
  {
    immediate: false,
  }
);

const repoData = computed(() => {
  if (ghData.value) {
    return ghData.value;
  }

  return {
    html_url: `https://github.com/${props.username}/${props.repo}`,
    description: "Failed to load repository info...",
    name: props.repo,
    owner: {
      login: props.username,
    },
    fork: false,
    stargazers_count: 0,
    forks: 0,
    language: "Unknown",
  };
});

onMounted(() => {
  refresh();
});
</script>
