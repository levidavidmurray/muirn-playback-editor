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
      <VideoResult v-for="result in videoResults" :result="result" class="mr-8 mb-8" />
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'
import VideoResult from '@/components/VideoResult.vue'
import AvatarMenu from '@/components/AvatarMenu.vue'
import { VideoResultDto } from '@/api/types';
import { useFamilyQuery, useMeQuery } from '@/stores/query';
import { computed } from 'vue';

const { data: user } = useMeQuery()

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
