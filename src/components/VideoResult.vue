<template>
  <div class="video-result">
    <div
      @click="handleClick"
      class="video-thumbnail flex justify-center items-center shadow-lg cursor-pointer relative rounded-lg overflow-hidden">
      <!-- <i class="fa-regular fa-circle-play text-6xl text-white relative z-10"></i> -->
      <img v-if="result.thumbnail_url" :src="result.thumbnail_url" class="w-full h-full absolute object-cover">
    </div>
    <div class="flex mt-4">
      <avatar :src="result.uploader?.avatar_url" size="32px" />
      <div class="ml-2">
        <span class="font-semibold block leading-5 cursor-pointer" @click="handleClick">{{ result.title }}</span>
        <div class="text-sm text-gray-600 flex items-center justify-between">
          <span>Levi Murray</span>
          <span>Apr 2001</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoResultDto } from '@/api/types';
import Avatar from './Avatar.vue'

const { result } = defineProps<{
  result: VideoResultDto
}>()

const emit = defineEmits<{
  select: [VideoResultDto]
}>()

function handleClick() {
  emit('select', result)
}
</script>

<style scoped>
.video-result {
  max-width: 256px;
}

.video-thumbnail {
  width: 256px;
  height: 144px;
  border-radius: 8px;
}

.video-details {
}
</style>
