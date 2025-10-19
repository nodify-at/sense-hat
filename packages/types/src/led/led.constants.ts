import type { RGB } from './led.types.js'

/**
 * LED matrix dimensions
 */
export const LED_MATRIX = {
    WIDTH: 8,
    HEIGHT: 8,
    TOTAL_PIXELS: 64,
    FRAMEBUFFER_SIZE: 128,
} as const

/**
 * Common color presets
 */
export const Colors: Record<string, RGB> = {
    OFF: { r: 0, g: 0, b: 0 },
    WHITE: { r: 255, g: 255, b: 255 },
    RED: { r: 255, g: 0, b: 0 },
    GREEN: { r: 0, g: 255, b: 0 },
    BLUE: { r: 0, g: 0, b: 255 },
    YELLOW: { r: 255, g: 255, b: 0 },
    CYAN: { r: 0, g: 255, b: 255 },
    MAGENTA: { r: 255, g: 0, b: 255 },
    ORANGE: { r: 255, g: 165, b: 0 },
    PURPLE: { r: 128, g: 0, b: 128 },
} as const
