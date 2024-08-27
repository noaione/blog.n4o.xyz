import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";

export default defineNuxtPlugin((nuxtApp) => {
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
  });

  nuxtApp.hook("page:finish", () => {
    mermaid.run({
      querySelector: ".mermaid-base",
      postRenderCallback: (id) => {
        // El is the SVG element
        const el = document.getElementById(id);

        if (el) {
          // Check SVG rendered height
          const clientRect = el.getBoundingClientRect();

          // Set proper min-height since svgPanZoom somehow fucks up the height
          // add extra 48px padding
          el.style.minHeight = `${Math.ceil(clientRect.height + 48)}px`;

          svgPanZoom(el, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
          });
        }
      },
      suppressErrors: false,
    });
  });

  nuxtApp.provide("mermaid", () => mermaid);
});
