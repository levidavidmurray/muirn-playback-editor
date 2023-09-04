<template>
  <base-template title="My Family">
    <div>
      <router-link to="/upload" class="font-semibold text-secondary-500">
        <i class="fa-solid fa-upload"></i>
        <span class="ml-2">Upload</span>
      </router-link>
    </div>
    <div class="flex flex-wrap mt-4">
      <VideoResult v-for="result in videoResults" :result="result" class="mr-8 mb-8" />
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'
import VideoResult from '@/components/VideoResult.vue'
import { VideoResultDto } from '@/api/types';

const testVideo = {
  title: "Waking Up in a Stranger's House in Mexico",
  uploader: {
    avatar_url: '/levi-avatar.jpg',
  },
}

const videoResults: VideoResultDto[] = []

for (let i = 0; i < 8; i++) {
  videoResults.push(testVideo)
}
</script>
