<template>
  <file-drop-zone class="w-screen h-screen fixed inset-0 z-30 pointer-events-none" #default="{ dropZoneActive }">
    <div v-if="dropZoneActive" class="w-full h-full backdrop-blur-sm flex justify-center items-center">
      <h1 class="text-5xl font-bold text-white">DROP VIDEOS</h1>
    </div>
  </file-drop-zone>
</template>

<script setup lang="ts">
import FileDropZone from '@/components/FileDropZone.vue'
</script>
