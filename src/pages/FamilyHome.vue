<template>
  <base-template :title="familyName">
    <div class="flex items-center justify-between">
      <router-link to="/upload" class="font-semibold text-secondary-500">
        <i class="fa-solid fa-upload"></i>
        <span class="ml-2">Upload</span>
      </router-link>
      <avatar-menu />
    </div>
    <div class="flex flex-wrap mt-4">
      <video-result v-for="result in videoResults" @select="handleVideoSelect" :result="result" class="mr-8 mb-8" />
    </div>
  </base-template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseTemplate from './BaseTemplate.vue'
import VideoResult from '@/components/VideoResult.vue'
import AvatarMenu from '@/components/AvatarMenu.vue'
import { VideoResultDto } from '@/api/types';
import { useFamilyQuery, useMeQuery } from '@/stores/query';
import router from '@/router';

const { data: user } = useMeQuery()

const handleVideoSelect = (video: VideoResultDto) => {
  router.push({ name: 'video', params: { videoId: video.id } })
}

const familyId = computed(() => {
  return user.value?.data.relationships?.family.data.id || ''
})

const queryEnabled = computed(() => !!user.value)

const { data: family } = useFamilyQuery(familyId, queryEnabled)

const familyName = computed(() => {
  if (!family.value) return 'Loading'
  return family.value.data.attributes?.name
})

const testVideo = {
  id: '1',
  title: "Levi & Drew are gonna get married!",
  video_url: 'https://muirn-dev.s3.us-east-2.amazonaws.com/videos/levi-drew-wedding/index.m3u8',
  thumbnail_url: 'https://muirn-dev.s3.us-east-2.amazonaws.com/videos/levi-drew-wedding/FullImage_000000015.jpg',
  uploader: {
    avatar_url: '/levi-avatar.jpg',
  },
}

const videoResults: VideoResultDto[] = []

for (let i = 0; i < 8; i++) {
  videoResults.push(testVideo)
}
</script>
