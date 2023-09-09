<template>
  <base-template :title="familyName">
    <div class="flex flex-wrap">
      <video-result v-for="video in videos" @select="handleVideoSelect" :video="video" class="mr-8 mb-8" />
    </div>
  </base-template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseTemplate from './BaseTemplate.vue'
import VideoResult from '@/components/VideoResult.vue'
import { IVideoRecord, VideoResultDto } from '@/api/types';
import { useFamilyQuery, useMeQuery, useVideosQuery } from '@/stores/query';
import router from '@/router';

const { data: user } = useMeQuery()

const handleVideoSelect = (video: IVideoRecord) => {
  router.push({ name: 'videoView', params: { id: video.id } })
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

const { data: videos } = useVideosQuery()

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
