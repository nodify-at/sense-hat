import { Colors, LedMatrix, type RGB } from '@nodify-at/sense-hat'
import { setTimeout as sleep } from 'node:timers/promises'

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...')
    process.exit(0)
})

/**
 * Bouncing Ball Demo
 * Simulates a ball bouncing around the LED matrix with physics
 */
const matrix = new LedMatrix()

try {
    matrix.initialize()
    console.log('⚽ Starting bouncing ball demo...')
    console.log('Press Ctrl+C to exit')

    // Ball state
    let x = 4.0
    let y = 4.0
    let vx = 0.15 // Velocity X
    let vy = 0.12 // Velocity Y

    // Trail history (for motion blur effect)
    const trail: { x: number; y: number; age: number }[] = []
    const maxTrailLength = 5

    while (true) {
        matrix.clear()

        // Update position
        x += vx
        y += vy

        // Bounce off walls
        if (x <= 0 || x >= 7) {
            vx = -vx
            x = Math.max(0, Math.min(7, x))
        }

        if (y <= 0 || y >= 7) {
            vy = -vy
            y = Math.max(0, Math.min(7, y))
        }

        // Add current position to trail
        trail.push({ x, y, age: 0 })
        if (trail.length > maxTrailLength) {
            trail.shift()
        }

        // Age the trail
        trail.forEach((point) => point.age++)

        // Draw trail with fading effect
        trail.forEach((point) => {
            const intensity = 1 - point.age / maxTrailLength
            const color: RGB = {
                r: Math.round(Colors.CYAN.r * intensity),
                g: Math.round(Colors.CYAN.g * intensity),
                b: Math.round(Colors.CYAN.b * intensity),
            }

            const px = Math.round(point.x)
            const py = Math.round(point.y)

            if (px >= 0 && px < 8 && py >= 0 && py < 8) {
                matrix.setPixel({ x: px, y: py }, color)
            }
        })

        // Draw ball (brighter than trail)
        const ballX = Math.round(x)
        const ballY = Math.round(y)
        matrix.setPixel({ x: ballX, y: ballY }, Colors.WHITE)

        await sleep(50)
    }
} finally {
    matrix.clear()
    matrix.close()
}
