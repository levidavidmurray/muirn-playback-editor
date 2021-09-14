<template>
  <base-template title="Upload">
    <div class="max-w-screen-lg mx-auto">
      <div class="aspect-w-16 aspect-h-9 bg-black">
        <video
          ref="video"
          src="/home_video.mov"
          @loadedmetadata="onLoadedMetadata"
          @timeupdate="onTimeUpdate"
        ></video>
      </div>
      <div
        ref="timeline"
        class="flex relative bg-gray-300 w-100 max-w-screen-lg mx-auto mt-2"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
      >
        <div ref="scrubber" class="scrubber z-20 bg-yellow-400"></div>
        <div ref="highlight" class="scrubber z-10" :class="scrubberHighlightClasses"></div>
        <div
          v-for="(segment, index) in segments"
          segment
          class="segment bg-accent-400"
          :key="`segment-${index}`"
          :style="getSegmentStyles(segment, index)"
        ></div>
      </div>
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'

import { clamp, isBetween } from '@/util/math';
import { computed, reactive, Ref, ref, StyleValue } from 'vue'

interface VideoSegment {
  startTime: number;
  endTime: number;
}

enum EDIT_MODE {
  SELECT,
  CUT,
}

const segments: VideoSegment[] = reactive([]);

const video: Ref<HTMLVideoElement | null> = ref(null);
const highlight: Ref<HTMLElement | null> = ref(null);
const scrubber: Ref<HTMLElement | null> = ref(null);
const timeline: Ref<HTMLElement | null> = ref(null);

const isHighlightVisible = ref(false);
const isMouseDown = ref(false);
const mouseMoveDebug = ref(false);
const editMode = ref(EDIT_MODE.SELECT);

let currentSegmentIndex = 0;

function isMode(mode: EDIT_MODE) {
  return editMode.value === mode;
}

function onLoadedMetadata(event: any) {
  segments.push({
    startTime: 0,
    endTime: video.value!.duration,
  });
}

function onTimeUpdate(event: any) {
  setScrubberPosition(getTimelinePositionForTime(video.value!.currentTime));
  // No segments in timeline
  if (segments.length === 0) return;

  // Segment for current index doesn't exist
  if (!segments[currentSegmentIndex]) return;

  const currentSegment = segments[currentSegmentIndex];
  const { currentTime } = video.value!;

  // Stay on current segment if currentTime is less than the
  // end time of current segment
  if (currentTime < currentSegment.endTime) return;

  // playback time is greater than current segment's end time
  // so change to next segment
  currentSegmentIndex++;
  const newSegment = segments[currentSegmentIndex];

  // Set current video time to start time of new segment
  video.value!.currentTime = newSegment.startTime;
}

function findSegmentIndexForTime(time: number): number {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (isBetween(time, segment.startTime, segment.endTime)) {
      return i;
    }
  }

  return -1;
}

function setScrubberPosition(x: number) {
  scrubber.value?.style.setProperty('--x', `${x}px`);
}

function splitAtTime(time: number) {
  const segmentIndex = findSegmentIndexForTime(time);

  // Segment index not found for specified time
  if (segmentIndex < 0) return;

  const segmentToSplit = segments[segmentIndex];
  const newSegment: VideoSegment = {
    startTime: time,
    endTime: segmentToSplit.endTime,
  };
  segmentToSplit.endTime = time - 0.01;
  segments.splice(segmentIndex + 1, 0, newSegment);
}

function getTimelinePositionForTime(time: number): number {
  const timelineValue = time / video.value!.duration;
  const { clientWidth } = timeline.value!;
  return clientWidth * timelineValue;
}

function getTimelineInterpolation(xPos: number): number {
  if (!timeline.value || !video.value) return 0;

  const timelineWidth = timeline.value.clientWidth;
  return Math.max(xPos, 0) / timelineWidth;
}

function handleMouseMove({ offsetX }: { offsetX: number }) {
  if (!timeline.value || !video.value) return;

  const timelineValue = getTimelineInterpolation(offsetX);
  highlight.value?.style.setProperty('--x', `${offsetX}px`);
  isHighlightVisible.value = !isMouseDown.value;

  if (isMouseDown.value) {
    setScrubberPosition(offsetX);
    video.value.currentTime = video.value.duration * timelineValue;
  }
}

function onMouseMove(event: MouseEvent) {
  // stop document listener from executing handleMouseMove
  event.stopImmediatePropagation();
  const { offsetX } = event;
  if (mouseMoveDebug.value) {
    console.log("[timeline] onMouseMove", event)
  }
  handleMouseMove({ offsetX })
}

function onMouseLeave() {
  isHighlightVisible.value = false;
}

function onMouseDown({ offsetX }: MouseEvent) {
  isMouseDown.value = true;
  scrubber.value?.style.setProperty('--x', `${offsetX}px`);
  handleMouseMove({ offsetX });

  if (isMode(EDIT_MODE.CUT)) {
    const timelineValue = getTimelineInterpolation(offsetX);
    const splitTime = video.value!.duration * timelineValue;

    splitAtTime(splitTime);

  }
}

function onMouseUp() {
  isMouseDown.value = false;
}

function documentMouseUpListener() {
  isMouseDown.value = false;
}

// Continue scrubber control if cursor moves outside timeline element
function documentMouseMoveListener(event: MouseEvent) {
  if (!timeline.value || !isMouseDown.value) return;
  const { clientX: cursorOffsetX } = event;

  const { offsetLeft, offsetWidth } = timeline.value;
  const maxOffsetX = offsetLeft + offsetWidth
  const calculatedOffsetX = clamp(cursorOffsetX, offsetLeft, maxOffsetX) - offsetLeft;

  if (mouseMoveDebug.value) {
    console.log("[document] onMouseMove", event)
    console.log(`
      cursorOffsetX: ${cursorOffsetX},
      timeline.offsetLeft: ${offsetLeft},
      calculatedOffsetX: ${calculatedOffsetX},
    `);
  }

  handleMouseMove({ offsetX: calculatedOffsetX });
}

// function getSegmentClasses(index: number) {
//   return segmentColors[index];
// }

function getSegmentStyles(segment: VideoSegment, index: number) {
  const SEGMENT_GUTTER = 3;
  let segmentStartPos = getTimelinePositionForTime(segment.startTime);
  let segmentEndPos = getTimelinePositionForTime(segment.endTime);

  if (index > 0) {
    segmentStartPos += SEGMENT_GUTTER;
  }

  return {
    '--width': `${segmentEndPos - segmentStartPos}px`,
  } as StyleValue;
}

const scrubberHighlightClasses = computed(() => {
  return {
    'bg-gray-50': isMode(EDIT_MODE.SELECT),
    'bg-red-500': isMode(EDIT_MODE.CUT),
    'opacity-0': !isHighlightVisible.value,
  };
});

document.addEventListener('mouseup', documentMouseUpListener);
document.addEventListener('mousemove', documentMouseMoveListener);

const keyHandlers: { [key: string]: () => void } = {
  "KeyP": () => {
    mouseMoveDebug.value = !mouseMoveDebug.value;
  },
  "Space": () => {
    video.value?.paused ? video.value?.play() : video.value?.pause();
  },
  "KeyC": () => {
    editMode.value = EDIT_MODE.CUT;
  },
  "KeyV": () => {
    editMode.value = EDIT_MODE.SELECT;
  }
}

document.addEventListener('keydown', (event) => {
  keyHandlers[event.code]?.();
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

.segment {
  --width: 0;
  height: 64px;
  margin-left: 3px;
  width: var(--width);
  top: 0;
  pointer-events: none;
  z-index: 1;
  border-radius: 8px;
}

.segment:last-of-type {
  margin-right: 2px;
}
</style>
