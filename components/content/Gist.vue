<template>
  <Head>
    <Link
      rel="stylesheet"
      href="https://cdn.rawgit.com/lonekorean/gist-syntax-themes/848d6580/stylesheets/monokai.css"
    />
    <!-- eslint-disable-next-line vue/html-self-closing -->
    <Style type="text/css" :children="styling"></Style>
  </Head>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="!loading" class="gist-el-root" v-html="ghSrc" />
</template>

<script setup lang="ts">
import uniqid from "uniqid";

const props = defineProps<{
  id: string;
  file?: string;
}>();

const attachedStyles = ref(false);
const loading = ref(true);
const ghSrc = ref("");

const styling = `
.js-file-line-container > tbody > tr {
  border-bottom-width: 0px !important;
}

[class=dark] .gist .gist-data {
  background-color: #262626 !important;
  border-color: #4e4e4e !important;
}

[class=dark] .gist {
  color: #ddd;
}

[class=dark] .gist .gist-meta {
    color: #d8d8d8;
    background-color: #292929 !important;
}

[class=dark] .gist .gist-meta a {
  color: #ddd;
}

[class=dark] .gist .gist-file {
  border-color: #4e4e4e #4e4e4e #5e5e5e !important;
}

.gist .gist-file article {
  padding: 1rem !important;
}

[class=dark] .gist .blob-num:hover {
  color: rgb(145 148 150 / 60%) !important;
}

.gist-el-root .gist .markdown-body code::before {
  content: "" !important;
}

.gist-el-root .gist .markdown-body code::after {
  content: "" !important;
}

.gist-el-root .gist .markdown-body h1 {
  margin-bottom: 1.35rem;
}

.gist-el-root .gist .markdown-body h2 {
  margin-bottom: 1.1rem;
}

.gist-el-root .gist .markdown-body h3 {
  margin-bottom: 0.95rem;
}

.gist-meta .Link--inTextBlock {
  text-decoration-style: dashed !important;
}

.gist-meta .Link--inTextBlock:hover {
  text-decoration: underline !important;
  text-decoration-style: dashed !important;
}
`;

const runtimeConfig = useRuntimeConfig();
const gistCallbackId = `gistCallback_${props.id}_${uniqid("gh")}`;

onMounted(() => {
  if (!runtimeConfig.nitro) {
    // client-side only

    const script = document.createElement("script");

    const initUrl = `https://gist.github.com/${props.id}.json?callback=${gistCallbackId}`;
    const fileUrl = props.file ? `&file=${props.file}` : "";

    script.type = "text/javascript";
    script.src = `${initUrl}${fileUrl}`;

    // @ts-expect-error fuck you
    window[gistCallbackId] = (gistContent: { div: string; stylesheet: string }) => {
      loading.value = false;
      ghSrc.value = gistContent.div;

      if (!attachedStyles.value) {
        attachedStyles.value = true;

        const link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = gistContent.stylesheet;

        document.head.appendChild(link);
      }

      try {
        // @ts-expect-error fuck me
        delete window[gistCallbackId];
      } catch {}
    };

    document.body.appendChild(script);
  }
});
</script>
