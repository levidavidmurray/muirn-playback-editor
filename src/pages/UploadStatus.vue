<template>
<base-template>
  <div class="max-w-screen-lg mx-auto">
    <div v-if="isLoading">
      <div class="flex mb-4">
        <n-skeleton height="40px" class="grow" />
        <n-skeleton height="40px" class="w-72 ml-4" />
      </div>
      <n-skeleton height="500px" class="w-full" />
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <n-input placeholder="Enter Video Title" v-model:value="newVideoData.title" />
        <n-button type="primary" class="ml-4" @click="handleUpdate">Update</n-button>
      </div>
      <div class="flex items-center justify-between mb-4">
        <n-date-picker v-model:formatted-value="newVideoData.date" format="yyyy-MM-dd" type="date" />
      </div>
      <video-player v-if="videoSrc" :video-src="videoSrc" type="video/mp4" />
    </div>
  </div>
</base-template>
</template>

<script setup lang="ts">
import { useUploadMutation, useUploadQuery } from '@/stores/query';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import BaseTemplate from './BaseTemplate.vue';
import { NSkeleton, useMessage, NInput, NDatePicker, NButton } from 'naive-ui';
import router from '@/router';
import { format } from 'date-fns';
import VideoPlayer from '@/components/VideoPlayer.vue';

const route = useRoute()
const message = useMessage()

const { uploadId } = route.params as { uploadId: string}

const { isLoading, data: uploadData, error } = useUploadQuery(uploadId)

const { mutate: updateUpload } = useUploadMutation(uploadId)

const videoSrc = computed(() => {
  if (!uploadData.value) return null
  return uploadData.value.data.attributes!.videoUrl
})

const newVideoData = ref({
  title: '',
  date: format(new Date(), 'yyyy-MM-dd')
})

watch(uploadData, (newUploadData) => {
  if (!newUploadData) return
  console.log('newUploadData', newUploadData)
  newVideoData.value = {
    title: newUploadData.data.attributes?.title || newVideoData.value.title,
    date: newUploadData.data.attributes?.date || newVideoData.value.date,
  }
})

watch(error, (newError: any) => {
  if (!newError) return
  console.log('Error!', newError)
  message.error(newError.message)
  router.push({ name: 'home' })
})

function handleUpdate() {
  const data = { ...newVideoData.value }
  updateUpload(data)
}

</script>
