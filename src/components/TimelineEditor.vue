<template>
  <div
    ref="timeline"
    style="height: 64px"
    class="relative bg-gray-300 w-100 max-w-screen-lg mx-auto mt-2"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <div ref="scrubber" class="scrubber z-20 bg-yellow-400"></div>
    <div ref="highlight" class="scrubber z-10 bg-gray-50" :class="{ 'opacity-0': !isHighlightVisible }"></div>
  </div>
</template>

<script setup lang="ts">
import { clamp } from '@/util/math'
import { Ref, ref } from 'vue'

const props = defineProps<{ video: HTMLVideoElement }>()

const isHighlightVisible = ref(false)
const isMouseDown = ref(false)
const highlight: Ref<HTMLElement | null> = ref(null)
const scrubber: Ref<HTMLElement | null> = ref(null)
const timeline: Ref<HTMLElement | null> = ref(null)

const mouseMoveDebug = ref(false)

function handleMouseMove({ offsetX }: { offsetX: number }) {
  if (!timeline.value) return

  const timelineWidth = timeline.value.clientWidth
  const interpolatedX = Math.max(offsetX, 0) / timelineWidth
  highlight.value?.style.setProperty('--x', `${offsetX}px`)
  isHighlightVisible.value = !isMouseDown.value

  if (isMouseDown.value) {
    scrubber.value?.style.setProperty('--x', `${offsetX}px`)
  }
}

function onMouseMove(event: MouseEvent) {
  event.stopImmediatePropagation()
  const { offsetX } = event
  if (mouseMoveDebug.value) {
    console.log('[timeline] onMouseMove', event)
  }
  handleMouseMove({ offsetX })
}

function onMouseLeave() {
  isHighlightVisible.value = false
}

function onMouseDown({ offsetX }: MouseEvent) {
  isMouseDown.value = true
  scrubber.value?.style.setProperty('--x', `${offsetX}px`)
}

function onMouseUp() {
  isMouseDown.value = false
}

function documentMouseUpListener() {
  isMouseDown.value = false
}

function documentMouseMoveListener(event: MouseEvent) {
  if (!timeline.value || !isMouseDown.value) return
  const { clientX: cursorOffsetX } = event

  const { offsetLeft, offsetWidth } = timeline.value
  const maxOffsetX = offsetLeft + offsetWidth
  const calculatedOffsetX = clamp(cursorOffsetX, offsetLeft, maxOffsetX) - offsetLeft

  if (mouseMoveDebug.value) {
    console.log('[document] onMouseMove', event)
    console.log(`
      cursorOffsetX: ${cursorOffsetX},
      timeline.offsetLeft: ${offsetLeft},
      calculatedOffsetX: ${calculatedOffsetX},
    `)
  }

  handleMouseMove({ offsetX: calculatedOffsetX })
}

document.addEventListener('mouseup', documentMouseUpListener)
document.addEventListener('mousemove', documentMouseMoveListener)

document.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    mouseMoveDebug.value = !mouseMoveDebug.value
  }
})
</script>

<style scoped>
.scrubber {
  --x: 0;
  position: absolute;
  height: 100%;
  width: 2px;
  left: var(--x);
  pointer-events: none;
  top: 0;
}
</style>
