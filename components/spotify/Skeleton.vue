<template>
  <div class="flex flex-col items-center gap-4 md:flex-row md:items-start">
    <div class="relative">
      <USkeleton class="spotify-wave-skeleton block size-80 shadow-lg lg:size-96" />
    </div>
    <div class="flex w-full flex-col gap-2">
      <USkeleton class="mx-auto block h-8 md:mx-0 md:h-9 lg:h-10" />
      <USkeleton class="mx-auto block h-5 w-4/5 md:mx-0 md:h-7" />
      <USkeleton class="mx-auto block h-4 !w-3/5 md:mx-0 md:h-5" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.spotify-wave-skeleton {
  @apply ring-2 md:ring-[3px] lg:ring-4;
  animation: spotify-wave-ani 5s linear alternate infinite;
}

@keyframes spotify-wave-ani {
  from {
    --tw-ring-color: #4c98af;
  }
  to {
    --tw-ring-color: #009688;
  }
}
</style>
