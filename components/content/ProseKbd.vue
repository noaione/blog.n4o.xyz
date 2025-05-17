<template>
  <span ref="slotStroke"><slot /></span>
</template>

<script setup lang="ts">
const slotStroke = ref();

const mappedKeys = {
  Enter: "⏎ Enter",
  "Up Arrow": "↑",
  "Down Arrow": "↓",
  "Left Arrow": "←",
  "Right Arrow": "→",
};

onMounted(() => {
  // Replace the slot content with the computed stroke
  // <kbd v-for="key in computedStroke" :key="key">
  //   {{ key }}
  // </kbd>
  let textContent = (slotStroke.value.textContent ?? "").trim() as string;
  Object.keys(mappedKeys).forEach((key) => {
    const regex = new RegExp(key, "g");
    textContent = textContent.replace(regex, mappedKeys[key as keyof typeof mappedKeys]);
  });

  const splitStroke = textContent.split(" ").map((key) => {
    const mapped = mappedKeys[key as keyof typeof mappedKeys] ?? key;

    return `<kbd>${mapped}</kbd>`;
  });

  slotStroke.value.innerHTML = splitStroke.join("");
});
</script>

