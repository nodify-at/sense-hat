import { LedMatrix } from '@nodify-at/sense-hat'
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * Convert HSV to RGB
 */
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r: number, g: number, b: number

    switch (i % 6) {
        case 0:
            r = v
            g = t
            b = p
            break
        case 1:
            r = q
            g = v
            b = p
            break
        case 2:
            r = p
            g = v
            b = t
            break
        case 3:
            r = p
            g = q
            b = v
            break
        case 4:
            r = t
            g = p
            b = v
            break
        case 5:
            r = v
            g = p
            b = q
            break
        default:
            r = g = b = 0
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    }
}

// Handle a graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...')
    process.exit(0)
})

/**
 * Rainbow Animation Demo
 * Creates a beautiful rainbow pattern that cycles through the LED matrix
 */
const matrix = new LedMatrix()

try {
    matrix.initialize()
    console.log('🌈 Starting rainbow animation...')
    console.log('Press Ctrl+C to exit')

    let offset = 0

    // Run animation loop
    while (true) {
        const pixels: {
            position: { x: number; y: number }
            color: { r: number; g: number; b: number }
        }[] = []

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // Create rainbow effect using HSV-like calculation
                const hue = ((x + y + offset) % 24) / 24
                const color = hsvToRgb(hue, 1, 1)

                pixels.push({
                    position: { x, y },
                    color,
                })
            }
        }

        matrix.setPixels(pixels)
        offset++

        // 50ms delay for smooth animation
        await sleep(50)
    }
} finally {
    matrix.clear()
    matrix.close()
}
