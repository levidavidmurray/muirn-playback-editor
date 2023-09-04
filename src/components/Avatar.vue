<template>
  <img src="/levi-avatar.jpg" :style="computedStyles" class="rounded-full" alt="" />
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: string
}>()

const computedStyles = {
  width: props.size,
  height: props.size,
}
</script>
