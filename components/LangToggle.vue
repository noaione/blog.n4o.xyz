<template>
  <UDropdown :items="properLocales" :ui="{ item: { padding: '' }, divide: '' }" :popper="{ placement: 'bottom-end' }">
    <UIcon name="i-heroicons-language" class="h-6 w-6 transition-opacity duration-150 hover:opacity-80" />

    <template #item="{ item }">
      <NuxtLink
        :key="item.code"
        :to="switchLocalePath(item.code)"
        class="font-variable w-full px-1.5 py-2 text-left variation-weight-medium"
      >
        {{ item.label }}
      </NuxtLink>
    </template>
  </UDropdown>
</template>

<script setup lang="ts">
const { availableLocales, locales, locale, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();

function tLocale(code: string, fallbackName: string) {
  const res = t(`languages.${code}`);

  return res === `languages.${code}` ? fallbackName : res;
}

const properLocales = computed(() => {
  return locales.value
    .filter((locale) => availableLocales.includes(locale.code))
    .map((loc) => [
      {
        code: loc.code,
        label: tLocale(loc.code, loc.name || loc.code),
        disabled: loc.code === locale.value,
      },
    ]);
});
</script>
