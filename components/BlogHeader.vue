<template>
  <div class="my-4 flex flex-row justify-between py-4">
    <div class="flex flex-col">
      <h1
        class="font-variable cursor-pointer text-xl tracking-tight transition-opacity duration-150 variation-weight-bold hover:underline"
      >
        <NuxtLink v-if="!isInHome" :to="localePath('/')">
          {{ blogConfig?.title }}
        </NuxtLink>
        <template v-else>
          {{ blogConfig?.title }}
        </template>
      </h1>
    </div>
    <div class="flex flex-row items-center space-x-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item[0].key"
        :to="item[0].link"
        class="font-variable hidden tracking-tight variation-weight-[600] hover:underline md:block"
      >
        {{ item[0].label }}
      </NuxtLink>
      <DarkToggle />
      <LangToggle />
      <UDropdown
        class="inline-flex md:hidden"
        :items="navItems"
        :ui="{ item: { padding: '' }, divide: '' }"
        :popper="{ placement: 'bottom-end' }"
      >
        <UIcon name="heroicons:bars-3" class="h-6 w-6 transition-opacity duration-150 hover:opacity-80" />
        <template #item="{ item }">
          <NuxtLink :to="item.link" class="font-variable w-full py-2 pl-1.5 text-left variation-weight-medium">
            {{ item.label }}
          </NuxtLink>
          <UIcon :name="item.icon" class="mx-1.5 h-6 w-6" />
        </template>
      </UDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const blogConfig = useBlogConfig();
const localePath = useLocalePath();
const route = useRoute();

const isInHome = computed(() => {
  return route.path === localePath("/");
});

const navItems = computed(() => [
  [
    {
      key: "blog",
      label: t("nav.blog"),
      link: localePath("/posts"),
      icon: "heroicons:pencil",
    },
  ],
  [
    {
      key: "tags",
      label: t("nav.tags"),
      link: localePath("/tags"),
      icon: "heroicons:tag",
    },
  ],
  [
    {
      key: "about",
      label: t("nav.about"),
      link: localePath("/about"),
      icon: "heroicons:user",
    },
  ],
]);
</script>
