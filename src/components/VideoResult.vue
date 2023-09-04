<template>
  <div class="video-result">
    <div class="video-thumbnail flex justify-center items-center shadow-lg">
      <i class="fa-regular fa-circle-play text-6xl text-white"></i>
    </div>
    <div class="flex mt-4">
      <avatar :src="result.uploader?.avatar_url" size="32px" />
      <span class="font-semibold ml-2 leading-5">{{ result.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoResultDto } from '@/api/types';
import Avatar from './Avatar.vue'

defineProps<{
  result: VideoResultDto
}>()
</script>

<style scoped>
.video-result {
  max-width: 256px;
}

.video-thumbnail {
  background-color: #0b2837;
  width: 256px;
  height: 144px;
  border-radius: 8px;
}

.video-details {
}
</style>
