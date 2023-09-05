<template>
  <video ref="videoPlayer" class="video-js vjs-big-play-centered vjs-theme-forest"></video>
</template>

<script setup lang="ts">
import { VideoResultDto } from '@/api/types';
import videojs from 'video.js'
import { onMounted, ref } from 'vue'

const { video } = defineProps<{
  video: VideoResultDto
}>()

const options: videojs.PlayerOptions = {
  autoplay: true,
  controls: true,
  aspectRatio: '16:9',
  responsive: true,
  sources: [
    {
      src: video.video_url!,
      type: 'application/x-mpegURL'
    }
  ]
}

const videoPlayer = ref<HTMLVideoElement>()
const player = ref<videojs.Player>()

onMounted(() => {
  player.value = videojs(videoPlayer.value!, options, () => {
    console.log('onPlayerReady', this)
  })
})
</script>

<style>
@import 'video.js/dist/video-js.css';
@import '@videojs/themes/dist/forest/index.css';

.video-js {
  /* font-size: 1rem; */
}

.video-js .vjs-progress-control:hover .vjs-time-tooltip {
  font-size: 1em;
}
</style>
