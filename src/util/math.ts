/**
 * Constrain {number} to {min} and {max} values
 */
export function clamp(number: number, min: number, max: number): number {
  return Math.max(min, Math.min(number, max))
}

/**
 * Return true if {number} is between {min} and {max}
 */
export function isBetween(number: number, min: number, max: number): boolean {
  return number >= min && number <= max
}
