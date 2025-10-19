import { LedMatrix, Colors, Rotation } from '@nodify-at/sense-hat'
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * Basic LED Matrix Usage Examples
 * Demonstrates fundamental operations with the LED matrix
 */
const matrix = new LedMatrix({
    lowLight: false,
    rotation: Rotation.ROTATE_0,
})

try {
    matrix.initialize()
    console.log('💡 Basic LED Matrix Demo\n')

    // 1. Set individual pixels
    console.log('1️⃣  Setting individual pixels...')
    matrix.clear()
    matrix.setPixel({ x: 0, y: 0 }, Colors.RED) // Top-left
    matrix.setPixel({ x: 7, y: 0 }, Colors.GREEN) // Top-right
    matrix.setPixel({ x: 0, y: 7 }, Colors.BLUE) // Bottom-left
    matrix.setPixel({ x: 7, y: 7 }, Colors.YELLOW) // Bottom-right
    await sleep(2000)

    // 2. Fill entire matrix
    console.log('2️⃣  Filling with solid colors...')
    const solidColors = [Colors.RED, Colors.GREEN, Colors.BLUE, Colors.PURPLE]
    for (const color of solidColors) {
        matrix.fill(color)
        await sleep(500)
    }

    // 3. Draw a pattern
    console.log('3️⃣  Drawing a smiley face...')
    matrix.clear()
    const smiley = [
        { position: { x: 1, y: 1 }, color: Colors.YELLOW }, // Left eye
        { position: { x: 6, y: 1 }, color: Colors.YELLOW }, // Right eye
        { position: { x: 1, y: 5 }, color: Colors.YELLOW }, // Mouth left
        { position: { x: 2, y: 6 }, color: Colors.YELLOW },
        { position: { x: 3, y: 6 }, color: Colors.YELLOW },
        { position: { x: 4, y: 6 }, color: Colors.YELLOW },
        { position: { x: 5, y: 6 }, color: Colors.YELLOW },
        { position: { x: 6, y: 5 }, color: Colors.YELLOW }, // Mouth right
    ]
    matrix.setPixels(smiley)
    await sleep(2000)

    // 4. Draw a gradient
    console.log('4️⃣  Drawing a gradient...')
    const gradientPixels: {
        position: { x: number; y: number }
        color: { r: number; g: number; b: number }
    }[] = []
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            gradientPixels.push({
                position: { x, y },
                color: {
                    r: Math.round((x / 7) * 255),
                    g: Math.round((y / 7) * 255),
                    b: 128,
                },
            })
        }
    }
    matrix.setPixels(gradientPixels)
    await sleep(2000)

    // 5. Test rotation
    console.log('5️⃣  Testing rotation...')
    matrix.clear()
    matrix.setPixel({ x: 1, y: 0 }, Colors.RED)
    matrix.setPixel({ x: 2, y: 0 }, Colors.GREEN)
    matrix.setPixel({ x: 3, y: 0 }, Colors.BLUE)
    await sleep(1000)

    const rotations = [
        Rotation.ROTATE_90,
        Rotation.ROTATE_180,
        Rotation.ROTATE_270,
        Rotation.ROTATE_0,
    ]
    for (const rotation of rotations) {
        console.log(`   Rotating to ${rotation}°`)
        matrix.setRotation(rotation)
        matrix.setPixel({ x: 1, y: 0 }, Colors.RED)
        matrix.setPixel({ x: 2, y: 0 }, Colors.GREEN)
        matrix.setPixel({ x: 3, y: 0 }, Colors.BLUE)
        await sleep(1000)
    }

    // 6. Test low light mode
    console.log('6️⃣  Testing low-light mode...')
    matrix.fill(Colors.WHITE)
    await sleep(1000)
    console.log('   Enabling low-light mode...')
    matrix.setLowLight(true)
    matrix.fill(Colors.WHITE)
    await sleep(1000)
    console.log('   Disabling low-light mode...')
    matrix.setLowLight(false)
    matrix.fill(Colors.WHITE)
    await sleep(1000)

    // 7. Test flip operations
    console.log('7️⃣  Testing flip operations...')
    matrix.clear()
    // Draw an arrow pointing right
    const arrow: { r: number; g: number; b: number }[][] = [
        [
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.BLUE,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
        ],
        [
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.BLUE,
            Colors.BLUE,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
        ],
        [
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
        ],
        [
            Colors.OFF,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.OFF,
        ],
        [
            Colors.OFF,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.OFF,
        ],
        [
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
            Colors.BLUE,
        ],
        [
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.BLUE,
            Colors.BLUE,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
        ],
        [
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.BLUE,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
            Colors.OFF,
        ],
    ]
    matrix.setMatrix(arrow)
    await sleep(1500)

    console.log('   Flipping horizontally...')
    matrix.flipHorizontal()
    await sleep(1500)

    console.log('   Flipping vertically...')
    matrix.flipVertical()
    await sleep(1500)

    // Done
    console.log('\n✅ Demo complete!')
    matrix.clear()
} finally {
    matrix.close()
}
