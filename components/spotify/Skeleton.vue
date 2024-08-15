<template>
  <div class="flex flex-col items-center gap-4 md:flex-row md:items-start">
    <div class="relative">
      <USkeleton class="block h-96 w-96 shadow-lg ring-4 ring-green-500 ring-offset-gray-500" />
    </div>
    <div class="flex w-full flex-col gap-2">
      <USkeleton class="mx-auto block h-8 md:mx-0 md:h-9 lg:h-10" />
      <USkeleton class="mx-auto block h-5 w-4/5 md:mx-0 md:h-7" />
      <USkeleton class="mx-auto block h-4 !w-3/5 md:mx-0 md:h-5" />
    </div>
  </div>
</template>
