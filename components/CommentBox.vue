<template>
  <div ref="divWrapper" class="giscus-box" />
</template>

<script setup lang="ts">
interface GiscusSet {
  theme?: "light" | "dark" | "transparent_dark" | "preferred_color_scheme" | string;
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  term?: string;
  description?: string;
  backLink?: string;
  number?: number;
  strict?: boolean;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: "top" | "bottom";
  lang?: "id" | "en" | "ja";
}

const { locale } = useI18n();
const colorMode = useColorMode();

const divWrapper = ref();

onMounted(() => {
  const script = document.createElement("script");

  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", "noaione/blog.n4o.xyz");
  script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkzNjUyNTI3MzE=");
  script.setAttribute("data-category", "Blog Comment");
  script.setAttribute("data-category-id", "DIC_kwDOFcVQe84B-dOB");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "0");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");

  const light = colorMode.value === "light";
  const dark = colorMode.value === "dark";

  script.setAttribute("data-theme", light ? "light" : dark ? "transparent_dark" : "preferred_color_scheme");
  script.setAttribute("data-lang", locale.value);
  script.setAttribute("data-loading", "lazy");
  script.setAttribute("crossorigin", "anonymous");

  if (divWrapper.value) {
    divWrapper.value.appendChild(script);
  }
});

function broadcastMessage(config: GiscusSet) {
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");

  if (iframe) {
    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: config,
        },
      },
      "https://giscus.app"
    );
  }
}

const stopListen = watch(
  () => colorMode.value,
  (newValue) => {
    broadcastMessage({
      theme: newValue === "light" ? "light" : newValue === "dark" ? "transparent_dark" : "preferred_color_scheme",
    });
  }
);

onBeforeUnmount(() => {
  stopListen();
});
</script>
