<template>
  <div class="divide-y">
    <div class="space-y-2 pb-8 pt-6 md:space-y-5">
      <h1
        class="md:leading-14 font-variable text-3xl leading-9 tracking-tight text-gray-900 variation-weight-extrabold dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl"
      >
        {{ $t("nav.about") }}
      </h1>
    </div>
    <div class="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
      <div class="flex flex-col items-center pt-8">
        <ImageWrap :src="blogConfig.aboutImage" class="h-48 w-48 rounded-full" alt="Avatar" />
        <h3 class="font-variable mx-0 pb-2 pt-4 text-2xl leading-8 tracking-tight variation-weight-bold">
          {{ blogConfig.title }}
        </h3>
        <div class="text-center text-gray-500 dark:text-gray-400">
          {{ blogConfig.description }}
        </div>
        <div class="flex flex-wrap space-x-3 pt-6">
          <SocialIcon
            v-for="socialMedia in aboutContent?.socialMedia ?? []"
            :key="socialMedia.kind"
            v-bind="socialMedia"
          />
          <SocialIcon kind="rss" :link="`/feeds/${locale}.xml`" alt="RSS" />
        </div>
      </div>
      <div v-if="aboutContent" class="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
        <ContentRenderer :value="aboutContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useI18n();

const blogConfig = useBlogConfig();

const { data: aboutContent } = await useAsyncData(`homeblog-about-page-about-${locale.value}`, () =>
  queryCollection("aboutMeta").where("locale", "=", locale.value).first()
);

useBlogHead({
  title: t("nav.about"),
  description: t("desc.about"),
});
</script>
