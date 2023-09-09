<template>
  <base-template title="Upload">
    <div class="max-w-screen-lg mx-auto">

      <!-- Error Alert -->
      <n-alert v-if="uploadError" :title="uploadError.title" type="error" class="mb-4">
        {{ uploadError.message }}
      </n-alert>

      <n-upload accept="video/*"
                list-type="image"
                action="http://localhost:3000/uploads"
                response-type="json"
                :headers="uploadHeaders"
                @change="onFileChange"
                @error="onUploadError"
                @finish="onUploadFinish"
                >
        <n-upload-dragger>
          <i class="fa-solid fa-upload text-4xl mb-4 text-gray-400"></i>
          <p>Click or drag a file to this area to upload</p>
        </n-upload-dragger>
      </n-upload>
      <div class="flex items-center justify-between mb-4">
        <n-input placeholder="Enter Video Title" v-model:value="newVideoData.title" />
        <n-date-picker v-model:value="newVideoData.date" type="date" class="mx-4" />
      </div>
      <div class="flex items-center justify-between mb-4">
        <n-button type="primary" @click="handleUpload">Upload</n-button>
      </div>
    </div>
    <div style="max-width: 858px" class="mx-auto">
      <timeline-editor v-if="videoSrc" :src="videoSrc" />
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'
import TimelineEditor from '@/components/TimelineEditor.vue'

import { NButton, NInput, NDatePicker, NAlert, NUpload, NUploadDragger, UploadFileInfo } from 'naive-ui'
import { uploadVideoFn } from '@/api/authApi'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { OnError, OnFinish, SettledFileInfo } from 'naive-ui/es/upload/src/interface'
import { IUploadResponse } from '@/api/types'
import router from '@/router'

const route = useRoute()

const newVideoData = ref({
  title: '',
  date: new Date().getTime(),
})

if (route.params.videoId) {
  console.log('route.params.videoId', route.params.videoId)
}

const uploadError = ref<{title: string; message: string;} | null>(null)
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
}

const videoSrc = ref<string | null>(null)
const videoFile = ref(null)
const uploadFile = ref<UploadFileInfo | null>(null)

function onFileChange({ file }: { file: UploadFileInfo, fileList: Array<UploadFileInfo>, event?: Event }) {
  uploadFile.value = file
  console.log('onFileChange', file)
}

// @ts-ignore
const onUploadError: OnError = ({ event }: { file: SettledFileInfo; event?: ProgressEvent<XMLHttpRequest>; }) => {
  if (!event) return
  let error = event.target!.response
  if (typeof error === 'string') {
    error = JSON.parse(error)
  }
  uploadError.value = {
    title: error.error,
    message: error.exception
  }
  console.log(error)
}

// @ts-ignore
const onUploadFinish: OnFinish = ({ file, event }: { file: SettledFileInfo; event?: ProgressEvent<XMLHttpRequest>; }) => {
  if (!event?.target?.response) return
  const { data } = event.target.response as IUploadResponse

  if (!data || !data.id) {
    uploadError.value = {
      title: 'Upload Error',
      message: 'Something went wrong while uploading the video'
    }
    return
  }

  router.push({ name: 'videoEdit', params: { id: data.id }})
}

function handleUpload() {
  if (!videoFile.value) return
  console.log('handleUpload', videoFile.value)
  uploadVideoFn(videoFile.value)
}

function addFiles(event: any) {
  console.log(event)
}

function onVideoChange(event: any) {
  videoFile.value = event.target.files[0]
  if (videoFile.value) {
    // selectedSegmentMap = reactive(new Map())
    // segmentElRefs.value = []
    videoSrc.value = URL.createObjectURL(videoFile.value)
  }
}
</script>
