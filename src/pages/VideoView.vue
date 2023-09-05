<template>
  <base-template title="Video Player">
    <div class="max-w-7xl">
      <div class="overflow-hidden rounded-lg">
        <video-player :video="video" />
      </div>
      <div class="mt-4">
        <h3 class="my-0 font-semibold text-2xl">{{ video.title }}</h3>
        <p class="mt-1 mb-2 text-gray-600">{{ video.date }}</p>
        <div class="flex items-center">
          <avatar :src="video.uploader.avatar_url" size="32px" />
          <span class="ml-2 text-lg">{{ video.uploader.name }}</span>
        </div>
      </div>
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import Avatar from '@/components/Avatar.vue';

const video = {
  title: "Levi & Drew are gonna get married!",
  video_url: 'https://muirn-dev.s3.us-east-2.amazonaws.com/videos/levi-drew-wedding/index.m3u8',
  thumbnail_url: 'https://muirn-dev.s3.us-east-2.amazonaws.com/videos/levi-drew-wedding/FullImage_000000015.jpg',
  date: 'Apr 2001',
  uploader: {
    avatar_url: '/levi-avatar.jpg',
    name: 'Levi Murray'
  },
}
</script>
