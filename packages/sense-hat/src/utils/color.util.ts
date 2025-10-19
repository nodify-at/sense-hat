import { RGB } from '../types/index.js'

/**
 * Validates RGB color values are within valid range (0-255)
 */
export function validateRGB(color: RGB): void {
    if (
        color.r < 0 ||
        color.r > 255 ||
        color.g < 0 ||
        color.g > 255 ||
        color.b < 0 ||
        color.b > 255
    ) {
        throw new Error(
            `Invalid RGB values: (${color.r}, ${color.g}, ${color.b}). Values must be between 0-255.`
        )
    }
}

/**
 * Converts RGB888 color to RGB565 format (2 bytes)
 * RGB565: RRRR RGGG GGGB BBBB
 */
export function rgbToRGB565(color: RGB): number {
    validateRGB(color)
    const r5 = (color.r >> 3) & 0x1f
    const g6 = (color.g >> 2) & 0x3f
    const b5 = (color.b >> 3) & 0x1f
    return (r5 << 11) | (g6 << 5) | b5
}

/**
 * Converts RGB565 to RGB888 format
 */
export function rgb565ToRGB(value: number): RGB {
    const r5 = (value >> 11) & 0x1f
    const g6 = (value >> 5) & 0x3f
    const b5 = value & 0x1f
    return {
        r: (r5 << 3) | (r5 >> 2),
        g: (g6 << 2) | (g6 >> 4),
        b: (b5 << 3) | (b5 >> 2),
    }
}

/**
 * Creates RGB color from hex string
 * @example colorFromHex('#FF0000') // { r: 255, g: 0, b: 0 }
 */
export function colorFromHex(hex: string): RGB {
    const cleaned = hex.replace('#', '')
    if (cleaned.length !== 6) {
        throw new Error(`Invalid hex color: ${hex}. Expected format: #RRGGBB`)
    }
    return {
        r: parseInt(cleaned.substring(0, 2), 16),
        g: parseInt(cleaned.substring(2, 4), 16),
        b: parseInt(cleaned.substring(4, 6), 16),
    }
}

/**
 * Converts RGB to hex string
 */
export function rgbToHex(color: RGB): string {
    validateRGB(color)
    return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`.toUpperCase()
}
