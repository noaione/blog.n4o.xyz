/**
 * Code based on https://thriving.dev/blog/nuxt3-plugin-medium-zoom
 */

import { defineNuxtPlugin } from "#app";
import mediumZoom, { type Zoom } from "medium-zoom";

export default defineNuxtPlugin((nuxtApp) => {
  const selector = "[data-zoomable]";

  const zoom = mediumZoom(selector, {
    background: "transparent",
  });

  nuxtApp.hook("page:finish", () => {
    zoom.detach(selector);

    nextTick(() => {
      zoom.attach(selector);
    });
  });

  nuxtApp.provide("mediumZoom", () => zoom);
});

declare global {
  interface Window {
    __mediumZoom: Zoom;
  }
}
