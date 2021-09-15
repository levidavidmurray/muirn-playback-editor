<template>
  <base-template title="Upload">
    <div class="max-w-screen-lg mx-auto">
      <div style="max-width: 858px;" class="mx-auto">
        <div class="aspect-w-16 aspect-h-9 bg-black rounded-lg">
          <video
            ref="video"
            src="/home_video.mov"
            @loadedmetadata="onLoadedMetadata"
            @durationchange="onDurationChange"
            @timeupdate="onTimeUpdate"
          ></video>
        </div>
      </div>
      <!-- Timeline Background -->
      <div class="bg-secondary-100 rounded-lg overflow-hidden py-4 px-4 mt-6">
        <!-- Timeline -->
        <div
          ref="timeline"
          class="relative bg-secondary-100 w-100 max-w-screen-lg mx-auto"
          @mousemove.stop="onMouseMove"
          @mouseleave="onMouseLeave"
          @mousedown="onMouseDown"
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
              @mouseup.stop="(e) => onSegmentClick(e, segment, index)"
              :ref="(el) => setSegmentElRef(el, index)"
              :id="segment.id"
              :key="segment.id"
              :style="getSegmentStyles(segment, index)"
              :class="getSegmentClasses(index)"
            >
              <span style="font-size: 11px;">{{ segment.endTime - segment.startTime }}s</span>
            </div>
            <!-- Timeline Scrubber -->
            <div
              ref="scrubber"
              class="scrubber z-20"
              :class="{ 'pointer-events-none': isMovingScrubber }"
            >
              <div
                @mousedown="isMovingScrubber = true"
                :class="isMovingScrubber ? ['scale-125', 'shadow', 'shadow-lg'] : ''"
                class="scrubber-head z-10 transition-transform cursor-pointer rounded-circle bg-yellow-400 absolute"
              ></div>
              <div
                @mousedown="isMovingScrubber = isMode(EDIT_MODE.SELECT)"
                :class="{ 'scale-x-150': isMovingScrubber }"
                class="scrubber-tail transition-transform cursor-pointer absolute"
              >
                <div
                  class="scrubber-tail-line h-full mx-auto bg-yellow-400"
                  :class="isMovingScrubber ? ['shadow', 'shadow-lg'] : ''"
                ></div>
              </div>
            </div>
          </div>
          <div ref="highlight" class="scrubber z-10" :class="scrubberHighlightClasses"></div>
        </div>
      </div>
    </div>
  </base-template>
</template>

<script setup lang="ts">
import BaseTemplate from './BaseTemplate.vue'

import { clamp, isBetween } from '@/util/math';
import { computed, onBeforeUpdate, reactive, Ref, ref, StyleValue } from 'vue'
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

const SEGMENT_GAP_THRESHOLD = 0.01;

const segments: VideoSegment[] = reactive([]);
const segmentElRefs: Ref<HTMLElement[]> = ref([]);
let selectedSegmentMap: Map<string, boolean> = reactive(new Map());

const video: Ref<HTMLVideoElement | null> = ref(null);
const highlight: Ref<HTMLElement | null> = ref(null);
const scrubber: Ref<HTMLElement | null> = ref(null);
const timeline: Ref<HTMLElement | null> = ref(null);

const startTimeDisplay = ref("00:00");
const currentTimeDisplay = ref("00:00");
const endTimeDisplay = ref("00:00");

const isHighlightVisible = ref(false);
const isMovingScrubber = ref(false);
const mouseMoveDebug = ref(false);
const editMode = ref(EDIT_MODE.SELECT);

let currentSegmentIndex = 0;

onBeforeUpdate(() => {
  segmentElRefs.value = [];
});

function setSegmentElRef(el: any, index: number) {
  return segmentElRefs.value[index] = el as HTMLElement;
}

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
  const { currentTime } = video.value!;

  // No segments in timeline
  if (segments.length === 0) return;

  // Segment for current index doesn't exist
  if (!segments[currentSegmentIndex]) return;

  setScrubberPosition(getTimelinePositionForSegmentTime(currentTime));
  currentTimeDisplay.value = secondsToSmartFormat(currentTime);

  const currentSegment = segments[currentSegmentIndex];

  // Stay on current segment if currentTime is less than the
  // end time of current segment
  if (currentTime < currentSegment.endTime) return;

  // playback time is greater than current segment's end time
  // so change to next segment
  currentSegmentIndex++;
  const newSegment = segments[currentSegmentIndex];

  // Set current video time to start time of new segment
  video.value!.currentTime = newSegment.startTime;
  setScrubberPosition(getTimelinePositionForSegmentTime(video.value!.currentTime));
}

function findSegmentIndexForTime(time: number): number {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const timeToSegment = segment.startTime - time;
    if (isBetween(time, segment.startTime, segment.endTime) || isBetween(timeToSegment, 0, SEGMENT_GAP_THRESHOLD)) {
      return i;
    }
  }

  console.warn(`No segment found for time: ${time}`);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    console.log(`
      isBetween(${time}, ${segment.startTime}, ${segment.endTime})
    `);
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
  const newSegment = createSegment(time + SEGMENT_GAP_THRESHOLD, segmentToSplit.endTime);
  segmentToSplit.endTime = time;
  segments.splice(segmentIndex + 1, 0, newSegment);
}

function getTimelinePositionForSegmentTime(time: number): number {
  let segment: VideoSegment | undefined = segments[currentSegmentIndex];
  let segmentIndex = currentSegmentIndex;

  // Find segment with the corresponding time if time isn't in current segment
  if (!isBetween(time, segment.startTime, segment.endTime)) {
    segmentIndex = findSegmentIndexForTime(time);

    if (segmentIndex < 0) {
      return video.value!.currentTime;
    }

    segment = segments[segmentIndex];
  }

  const segmentEl = segmentElRefs.value[segmentIndex];
  const segmentDuration = segment.endTime - segment.startTime;
  const timeFromSegmentStart = time - segment.startTime;
  const segmentValue = timeFromSegmentStart / segmentDuration;

  return (segmentEl.clientWidth * segmentValue) + segmentEl.offsetLeft;
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

  if (isMovingScrubber.value) {
    setScrubberPosition(offsetX);
    video.value.currentTime = video.value.duration * timelineValue;
  }
}

function onSegmentClick(event: MouseEvent, segment: VideoSegment, index: number) {
  const { offsetX, target: segmentEl } = event;
  if (isMode(EDIT_MODE.SLICE)) {
    const segmentValue = Math.max(offsetX, 0) / (segmentEl as HTMLElement).clientWidth;
    const segmentDuration = segment.endTime - segment.startTime;
    const splitTime = segment.startTime + (segmentDuration * segmentValue);

    splitAtTime(splitTime);
    // Ensure correct segment is set after splitting segment
    currentSegmentIndex = findSegmentIndexForTime(video.value!.currentTime);

    return;
  }

  // Clear all existing selected segments if shift key isn't held
  if (!event.shiftKey) {
    clearSelectedSegments();
  }

  selectedSegmentMap.set(segment.id, true);
}

function clearSelectedSegments() {
  selectedSegmentMap.forEach((_, id) => selectedSegmentMap.set(id, false));
}

function onMouseMove(event: MouseEvent) {
  isHighlightVisible.value = isMode(EDIT_MODE.SLICE);
  const { offsetX } = event;
  if (mouseMoveDebug.value) {
    console.log('onMouseMove', offsetX, event);
  }
  handleMouseMove({ offsetX })
}

function onMouseLeave() {
  isHighlightVisible.value = false;
}

function onMouseDown({ offsetX }: MouseEvent) {
}

function documentMouseUpListener(event: MouseEvent) {
  if (mouseMoveDebug.value) {
    console.log('documentMouseUpListener', event);
  }
  isMovingScrubber.value = false;
  clearSelectedSegments();
}

// Continue scrubber control if cursor moves outside timeline element
function documentMouseMoveListener(event: MouseEvent) {
  if (!timeline.value || !isMovingScrubber.value) return;
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
    'pointer-events-none': isMovingScrubber.value,
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

const scrubberHighlightClasses = computed(() => {
  return {
    'bg-red-500': isMode(EDIT_MODE.SLICE),
    'opacity-0': !isHighlightVisible.value,
  };
});

document.addEventListener('mouseup', documentMouseUpListener);
document.addEventListener('mousemove', documentMouseMoveListener);

const keyHandlers: { [key: string]: (event: KeyboardEvent) => void } = {
  "KeyP": (event) => {
    mouseMoveDebug.value = !mouseMoveDebug.value;
  },
  "Space": (event) => {
    event?.preventDefault();
    video.value?.paused ? video.value?.play() : video.value?.pause();
  },
  "KeyC": (event) => {
    editMode.value = EDIT_MODE.SLICE;
  },
  "KeyV": (event) => {
    editMode.value = EDIT_MODE.SELECT;
  }
}

document.addEventListener('keydown', (event) => {
  keyHandlers[event.code]?.(event);
})
</script>

<style scoped>
.scrubber {
  --x: 0;
  position: absolute;
  left: var(--x);
  top: 0;
  height: 100%;
}

.scrubber-head {
  width: 12px;
  height: 12px;
  top: -16px;
  left: -5px;
}

.scrubber-tail {
  height: 200%;
  width: 6px;
  top: -12px;
  left: -2px;
}

.scrubber-tail-line {
  width: 2px;
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
