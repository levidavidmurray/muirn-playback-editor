<template>
  <div class="video-result">
    <div
      @click="handleClick"
      class="video-thumbnail flex justify-center items-center shadow-lg cursor-pointer relative rounded-lg overflow-hidden">
      <!-- <i class="fa-regular fa-circle-play text-6xl text-white relative z-10"></i> -->
      <img v-if="thumbnailUrl" :src="thumbnailUrl" class="w-full h-full absolute object-cover">
    </div>
    <div class="flex mt-4">
      <avatar :src="userAvatarUrl" size="32px" />
      <div class="ml-2">
        <span class="font-semibold block leading-5 cursor-pointer" @click="handleClick">{{ title }}</span>
        <div class="text-sm text-gray-600 flex items-center justify-between">
          <span>Levi Murray</span>
          <span>Apr 2001</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IVideoRecord } from '@/api/types';
import Avatar from './Avatar.vue'

const { video } = defineProps<{ video: IVideoRecord }>()

const thumbnailUrl = video.attributes?.thumbnailUrl
const title = video.attributes?.title
const userAvatarUrl = '/levi-avatar.jpg'

const emit = defineEmits<{ select: [IVideoRecord] }>()

function handleClick() {
  emit('select', video)
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
