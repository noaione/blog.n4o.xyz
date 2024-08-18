<template>
  <NuxtLoadingIndicator color="#425675" />
  <main class="font-monaspace-xenon font-variable min-h-screen tracking-tighter">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>
  <Teleport to="body">
    <NuxtRouteAnnouncer id="nuxt-route-announcer" />
  </Teleport>
</template>
