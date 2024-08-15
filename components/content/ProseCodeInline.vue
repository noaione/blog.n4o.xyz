<template>
  <code
    class="font-monaspace-neon font-variable rounded bg-[#f4ede8] px-1.5 py-1.5 tracking-normal text-[#575279] dark:bg-[#2a283e] dark:text-[#e0def4]"
  >
    <slot />
  </code>
</template>

<style lang="postcss" scoped>
code::before {
  content: "" !important;
}

code::after {
  content: "" !important;
}
</style>
