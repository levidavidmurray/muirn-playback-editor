/**
 * Return 0-padded string
 * e.g. 4 -> 04, 33 -> 33
 */
export function leftPad(input: number) {
  return input < 10 ? '0' + input : input
}

/**
 * Return seconds to HH:MM:SS format
 * e.g. 3792 -> 01:03:12
 */
export function secondsToHHMMSS(seconds: number, separator = ':') {
  return [
    leftPad(Math.floor(seconds / 3600)),
    leftPad(Math.floor((seconds % 3600) / 60)),
    leftPad(Math.floor(seconds % 60)),
  ].join(separator)
}

/**
 * Return seconds to MM:SS format
 * e.g. 412 -> 06:52
 */
export function secondsToMMSS(seconds: number, separator = ':') {
  return [leftPad(Math.floor(seconds / 60)), leftPad(Math.floor(seconds % 60))].join(separator)
}

/**
 * Return MM:SS if seconds is less than 1 hour, otherwise return HH:MM:SS
 */
export function secondsToSmartFormat(seconds: number) {
  if (seconds < 3600) {
    return secondsToMMSS(seconds)
  }

  return secondsToHHMMSS(seconds)
}
