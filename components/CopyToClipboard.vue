<template>
  <button
    class="invisible flex h-8 w-8 flex-row items-center rounded-sm border-2 py-0.5 opacity-0 transition group-hover:visible group-hover:opacity-100"
    :class="{
      'border-[#8c8c8c] dark:border-[#e0def4]': !clicked,
      'border-green-500': clicked,
      'absolute right-2 top-2': !unpin,
      'mr-2': unpin,
      'cursor-pointer': !clicked,
      'cursor-not-allowed': clicked,
    }"
    @click="copy"
  >
    <Icon
      name="heroicons:clipboard"
      class="m-auto h-5 w-5 transition"
      :class="{
        'text-[#8c8c8c] dark:text-[#e0def4]': !clicked && unpin,
        'text-green-500': clicked && unpin,
        '!bg-[#8c8c8c] dark:!bg-[#e0def4]': !clicked && !unpin,
        '!bg-green-500': clicked && !unpin,
      }"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  unpin?: boolean;
}>();

const emits = defineEmits<{
  copy: [];
}>();

const clicked = ref(false);

const copy = () => {
  if (clicked.value) {
    return;
  }

  clicked.value = true;
  emits("copy");
  setTimeout(() => {
    clicked.value = false;
  }, 2000);
};
</script>
