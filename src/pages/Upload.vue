<template>
  <base-template title="Upload">
    <div class="max-w-screen-lg mx-auto">
      <div class="aspect-w-16 aspect-h-9 bg-black rounded-lg">
        <video
          ref="video"
          src="/home_video.mov"
          @loadedmetadata="onLoadedMetadata"
          @durationchange="onDurationChange"
          @timeupdate="onTimeUpdate"
        ></video>
      </div>
      <!-- Timeline Background -->
      <div class="bg-secondary-100 rounded-lg overflow-hidden py-4 px-4 mt-6">
        <!-- Timeline -->
        <div
          ref="timeline"
          class="relative bg-secondary-100 w-100 max-w-screen-lg mx-auto"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
        >
          <!-- Time Indicator -->
          <div class="flex justify-between w-100 mb-4 text-sm font-semibold">
            <span>{{ startTimeDisplay }}</span>
            <span class="text-gray-700">{{ currentTimeDisplay }} / {{ endTimeDisplay }}</span>
            <span>{{ endTimeDisplay }}</span>
          </div>
          <!-- Timeline Segments -->
          <div class="relative flex w-100">
            <div
              v-for="(segment, index) in segments"
              class="segment"
              @click="(event) => onSegmentClick(event, segment, index)"
              :key="segment.id"
              :style="getSegmentStyles(segment, index)"
              :class="getSegmentClasses(index)"
            ></div>
            <!-- Timeline Scrubber -->
            <div ref="scrubber" class="scrubber z-20 bg-yellow-400"></div>
          </div>
          <!-- <div ref="highlight" class="scrubber z-10" :class="scrubberHighlightClasses"></div> -->
        </div>
      </div>
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'

import { clamp, isBetween } from '@/util/math';
import { computed, reactive, Ref, ref, StyleValue } from 'vue'
import { v4 as uuid } from 'uuid';
import { secondsToSmartFormat } from '@/util/date';

interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
}

enum EDIT_MODE {
  SELECT,
  SLICE,
}

const segments: VideoSegment[] = reactive([]);
let selectedSegmentMap: Map<string, boolean> = reactive(new Map());
let selectedSegments: VideoSegment[] = reactive([]);

const video: Ref<HTMLVideoElement | null> = ref(null);
const highlight: Ref<HTMLElement | null> = ref(null);
const scrubber: Ref<HTMLElement | null> = ref(null);
const timeline: Ref<HTMLElement | null> = ref(null);

const startTimeDisplay = ref("00:00");
const currentTimeDisplay = ref("00:00");
const endTimeDisplay = ref("00:00");

const isHighlightVisible = ref(false);
const isMouseDown = ref(false);
const mouseMoveDebug = ref(false);
const editMode = ref(EDIT_MODE.SELECT);

let currentSegmentIndex = 0;

function isMode(mode: EDIT_MODE) {
  return editMode.value === mode;
}

function createSegment(startTime: number, endTime: number): VideoSegment {
  const id = `segment-${uuid()}`;
  selectedSegmentMap.set(id, false);
  return {
    id,
    startTime,
    endTime,
  };
}

function onLoadedMetadata(event: any) {
  segments.push(createSegment(0, video.value!.duration));
}

function onDurationChange(event: any) {
  const lessThanHour = video.value!.duration < 3600;
  startTimeDisplay.value = lessThanHour ? startTimeDisplay.value : "00:00:00";
  currentTimeDisplay.value = secondsToSmartFormat(video.value!.currentTime);
  endTimeDisplay.value = secondsToSmartFormat(video.value!.duration);
}

function onTimeUpdate(event: any) {
  setScrubberPosition(getTimelinePositionForTime(video.value!.currentTime));
  currentTimeDisplay.value = secondsToSmartFormat(video.value!.currentTime);
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
  const newSegment = createSegment(time, segmentToSplit.endTime);
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
}

function onSegmentClick(event: MouseEvent, segment: VideoSegment, index: number) {
  if (isMode(EDIT_MODE.SLICE)) {
    return;
  }

  // Clear all existing selected segments if shift key isn't held
  if (!event.shiftKey) {
    selectedSegmentMap.forEach((isSelected, id) => {
      selectedSegmentMap.set(id, false);
    });
  }

  selectedSegmentMap.set(segment.id, true);
}

function onMouseMove(event: MouseEvent) {
  // stop document listener from executing handleMouseMove
  event.stopImmediatePropagation();
  const { offsetX } = event;
  handleMouseMove({ offsetX })
}

function onMouseLeave() {
  isHighlightVisible.value = false;
}

function onMouseDown({ offsetX }: MouseEvent) {
  if (isMode(EDIT_MODE.SELECT)) {
    return;
  }
  isMouseDown.value = true;
  handleMouseMove({ offsetX });

  if (isMode(EDIT_MODE.SLICE)) {
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

function getSegmentClasses(index: number) {
  const isSelected = selectedSegmentMap.get(segments[index].id);
  return {
    'pointer-events-none': isMode(EDIT_MODE.SLICE),
    'bg-primary-500': isSelected,
    'bg-primary-400': !isSelected,
  };
}

function getSegmentStyles(segment: VideoSegment, index: number) {
  const SEGMENT_GUTTER = 2;
  let segmentStartPos = getTimelinePositionForTime(segment.startTime);
  let segmentEndPos = getTimelinePositionForTime(segment.endTime);

  if (index > 0) {
    segmentStartPos += SEGMENT_GUTTER;
  }

  return {
    '--width': `${segmentEndPos - segmentStartPos}px`,
  } as StyleValue;
}

/** Computed */

// const startTimeDisplay = computed(() => {
//   if (!video.value || video.value.currentTime < 3600) return "00:00";
//   return "00:00:00";
// });

// const endTimeDisplay = computed(() => {
//   if (!video.value || video.value.duration === undefined) return "00:00";
//   console.log(video.value.duration);
//   return secondsToSmartFormat(video.value.duration);
// });

// const currentTimeDisplay = computed(() => {
//   if (!video.value || video.value.currentTime === undefined) return "00:00";
//   console.log(video.value.currentTime);
//   return secondsToSmartFormat(video.value.currentTime);
// })

const scrubberHighlightClasses = computed(() => {
  return {
    'bg-gray-50': isMode(EDIT_MODE.SELECT),
    'bg-red-500': isMode(EDIT_MODE.SLICE),
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
    editMode.value = EDIT_MODE.SLICE;
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
  height: 200%;
  width: 2px;
  left: var(--x);
  pointer-events: none;
  top: 0;
}

.segment {
  --width: 0;
  height: 64px;
  margin-left: 2px;
  width: var(--width);
  top: 0;
  z-index: 1;
  border-radius: 8px;
}

.segment:last-of-type {
  margin-right: 2px;
}
</style>
