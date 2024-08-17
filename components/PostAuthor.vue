<template>
  <dl class="pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
    <dt class="sr-only">{{ $t("blog.author.title") }}</dt>
    <dd>
      <ul class="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
        <li v-for="author in computedAuthors ?? []" :key="author.id" class="flex items-center space-x-2">
          <ImageWrap v-if="author.avatar" :src="author.avatar" alt="Avatar" class="h-10 w-10 rounded-full" eager />
          <Icon v-else name="heroicons:user-solid" class="h-10 w-10 rounded-full" />
          <dl class="whitespace-nowrap text-sm leading-5">
            <dt class="sr-only">{{ $t("blog.author.name") }}</dt>
            <dd class="font-variable tracking-tight text-gray-900 variation-weight-semibold dark:text-gray-100">
              {{ author?.name ?? "Anon" }}
            </dd>
            <dt v-if="author.selectSocial" class="sr-only">{{ getSocialName(author.selectSocial.type) }}</dt>
            <dd v-if="author.selectSocial">
              <NuxtLink
                :to="author.selectSocial.url"
                class="normal-link font-variable break-words text-primary-500 variation-weight-medium"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="getSocialName(author.selectSocial.type)"
              >
                {{ author.selectSocial.text }}
              </NuxtLink>
            </dd>
          </dl>
        </li>
      </ul>
    </dd>
  </dl>
</template>

<script setup lang="ts">
const props = defineProps<{
  authors?: string | string[];
}>();

const { t } = useI18n();
const { getAuthor } = useBlogAuthor();

const computedAuthors = computed(() => {
  if (props.authors) {
    const authors = Array.isArray(props.authors) ? props.authors : [props.authors];
    const mapAuthors = authors
      .map((author) => {
        const authorData = getAuthor(author);

        if (authorData) {
          return {
            ...authorData,
            selectSocial: selectSocial(authorData),
          };
        }
      })
      .filter((author) => author !== undefined);

    return mapAuthors;
  }
});

function selectSocial(author: Author) {
  if (author.socialMedia?.github) {
    return { ...author.socialMedia.github, type: "github" };
  } else if (author.socialMedia?.twitter) {
    return { ...author.socialMedia.twitter, type: "twitter" };
  }
}

function getSocialName(social: string) {
  if (social === "github") {
    return t("blog.author.social.github");
  } else if (social === "twitter") {
    return t("blog.author.social.twitter");
  }
}
</script>
