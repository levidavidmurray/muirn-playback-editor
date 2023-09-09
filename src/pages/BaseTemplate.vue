<template>
  <header class="container py-8 mx-auto relative flex items-center justify-between">
    <router-link :to="{ name: 'home' }">
      <site-logo />
    </router-link>
    <avatar-menu />
  </header>
  <div class="container mx-auto">
    <slot></slot>
  </div>
  <footer class="container py-6 mx-auto text-center text-gray-700"></footer>
</template>
<script setup lang="ts">
import { useHead } from '@vueuse/head'
import AvatarMenu from '@/components/AvatarMenu.vue';
import SiteLogo from '@/components/SiteLogo.vue';

const props = defineProps<{
  title?: string
}>()

// Note: these are static. If you need these to be reactive, use ref() or reactive()
useHead({
  meta: [
    {
      property: 'og:title',
      content: props.title,
    },
    {
      name: 'twitter:title',
      content: props.title,
    },
  ],
})

const BUILD_TIME = new Date(Number(import.meta.env.VITE_APP_BUILD_EPOCH))
const APP_VERSION = import.meta.env.VITE_APP_VERSION
const thisYear = new Date().getFullYear()
</script>
