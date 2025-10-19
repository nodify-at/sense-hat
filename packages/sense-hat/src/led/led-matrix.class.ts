import { closeSync, openSync as fsOpenSync, writeSync } from 'fs'
import type { LEDMatrixConfig, Pixel, Position, RGB } from '../types/index.js'
import { Colors, LED_MATRIX, Rotation } from '../types/index.js'
import { rgbToRGB565, validateRGB } from '../utils/index.js'

/**
 * LED Matrix Manager for Raspberry Pi Sense HAT/HAT+
 *
 * Provides a developer-friendly interface to control the 8x8 RGB LED matrix.
 * Uses framebuffer device /dev/fb0 to interface with the LED driver.
 *
 * @example
 * ```typescript
 * const matrix = new LedMatrix();
 * await matrix.initialize();
 *
 * // Set a single pixel
 * matrix.setPixel({ x: 0, y: 0 }, { r: 255, g: 0, b: 0 });
 *
 * // Fill entire matrix
 * matrix.fill({ r: 0, g: 255, b: 0 });
 *
 * // Clear display
 * matrix.clear();
 *
 * await matrix.close();
 * ```
 */
export class LedMatrix {
    private static readonly FRAMEBUFFER_DEVICE = '/dev/fb0'
    private fbDevice: number | null = null
    private readonly framebuffer: Buffer
    private rotation: Rotation
    private lowLight: boolean
    private isInitialized = false
    private readonly config: Required<LEDMatrixConfig>

    constructor(config: LEDMatrixConfig = {}) {
        this.config = {
            i2cBus: config.i2cBus ?? 1,
            lowLight: config.lowLight ?? false,
            rotation: config.rotation ?? Rotation.ROTATE_0,
        }

        this.framebuffer = Buffer.alloc(LED_MATRIX.FRAMEBUFFER_SIZE)
        this.rotation = this.config.rotation
        this.lowLight = this.config.lowLight
    }

    /**
     * Initialize the LED matrix and framebuffer device
     */
    initialize(): void {
        if (this.isInitialized) {
            throw new Error('LedMatrix already initialized')
        }

        try {
            // Open framebuffer device for LED matrix control
            this.fbDevice = fsOpenSync(LedMatrix.FRAMEBUFFER_DEVICE, 'w+')
            this.isInitialized = true
        } catch (error) {
            throw new Error(
                `Failed to initialize LED matrix: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    /**
     * Close the framebuffer device and cleanup resources
     */
    close(): void {
        if (!this.isInitialized) {
            return
        }

        try {
            if (this.fbDevice !== null) {
                closeSync(this.fbDevice)
                this.fbDevice = null
            }
            this.isInitialized = false
        } catch (error) {
            throw new Error(
                `Failed to close LED matrix: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    /**
     * Set a single pixel at the specified position
     */
    setPixel(position: Position, color: RGB): void {
        this.ensureInitialized()
        this.validatePosition(position)
        validateRGB(color)

        const rotated = this.applyRotation(position)
        const index = (rotated.y * LED_MATRIX.WIDTH + rotated.x) * 2
        const rgb565 = rgbToRGB565(this.applyLowLight(color))

        this.framebuffer.writeUInt16LE(rgb565, index)
        this.updateDisplay()
    }

    /**
     * Get the color of a pixel at the specified position
     */
    getPixel(position: Position): RGB {
        this.ensureInitialized()
        this.validatePosition(position)

        const rotated = this.applyRotation(position)
        const index = (rotated.y * LED_MATRIX.WIDTH + rotated.x) * 2
        const rgb565 = this.framebuffer.readUInt16LE(index)

        const r5 = (rgb565 >> 11) & 0x1f
        const g6 = (rgb565 >> 5) & 0x3f
        const b5 = rgb565 & 0x1f

        return {
            r: (r5 << 3) | (r5 >> 2),
            g: (g6 << 2) | (g6 >> 4),
            b: (b5 << 3) | (b5 >> 2),
        }
    }

    /**
     * Set multiple pixels at once
     */
    setPixels(pixels: Pixel[]): void {
        this.ensureInitialized()

        for (const pixel of pixels) {
            this.validatePosition(pixel.position)
            validateRGB(pixel.color)

            const rotated = this.applyRotation(pixel.position)
            const index = (rotated.y * LED_MATRIX.WIDTH + rotated.x) * 2
            const rgb565 = rgbToRGB565(this.applyLowLight(pixel.color))
            this.framebuffer.writeUInt16LE(rgb565, index)
        }

        this.updateDisplay()
    }

    /**
     * Fill the entire matrix with a single color
     */
    fill(color: RGB): void {
        this.ensureInitialized()
        validateRGB(color)

        const rgb565 = rgbToRGB565(this.applyLowLight(color))

        for (let y = 0; y < LED_MATRIX.HEIGHT; y++) {
            for (let x = 0; x < LED_MATRIX.WIDTH; x++) {
                const index = (y * LED_MATRIX.WIDTH + x) * 2
                this.framebuffer.writeUInt16LE(rgb565, index)
            }
        }

        this.updateDisplay()
    }

    /**
     * Clear the entire matrix (turn all LEDs off)
     */
    clear(): void {
        this.fill(Colors.OFF)
    }

    /**
     * Set the entire matrix from a 2D array of colors
     * @param pixels 8x8 array of RGB colors
     */
    setMatrix(pixels: RGB[][]): void {
        this.ensureInitialized()

        if (pixels.length !== LED_MATRIX.HEIGHT) {
            throw new Error(
                `Invalid matrix height: ${pixels.length}. Expected ${LED_MATRIX.HEIGHT}`
            )
        }

        for (let y = 0; y < LED_MATRIX.HEIGHT; y++) {
            if (pixels[y].length !== LED_MATRIX.WIDTH) {
                throw new Error(
                    `Invalid matrix width at row ${y}: ${pixels[y].length}. Expected ${LED_MATRIX.WIDTH}`
                )
            }

            for (let x = 0; x < LED_MATRIX.WIDTH; x++) {
                validateRGB(pixels[y][x])
                const rotated = this.applyRotation({ x, y })
                const index = (rotated.y * LED_MATRIX.WIDTH + rotated.x) * 2
                const rgb565 = rgbToRGB565(this.applyLowLight(pixels[y][x]))
                this.framebuffer.writeUInt16LE(rgb565, index)
            }
        }

        this.updateDisplay()
    }

    /**
     * Get the entire matrix as a 2D array of colors
     */
    getMatrix(): RGB[][] {
        this.ensureInitialized()
        const matrix: RGB[][] = []

        for (let y = 0; y < LED_MATRIX.HEIGHT; y++) {
            const row: RGB[] = []
            for (let x = 0; x < LED_MATRIX.WIDTH; x++) {
                row.push(this.getPixel({ x, y }))
            }
            matrix.push(row)
        }

        return matrix
    }

    /**
     * Set display rotation
     */
    setRotation(rotation: Rotation): void {
        if (!Object.values(Rotation).includes(rotation)) {
            throw new Error(`Invalid rotation: ${rotation}. Must be 0, 90, 180, or 270`)
        }
        this.rotation = rotation
    }

    /**
     * Enable or disable low-light mode
     */
    setLowLight(enabled: boolean): void {
        this.lowLight = enabled
    }

    /**
     * Flip the display horizontally
     */
    flipHorizontal(): void {
        this.ensureInitialized()
        const current = this.getMatrix()

        for (let y = 0; y < LED_MATRIX.HEIGHT; y++) {
            for (let x = 0; x < LED_MATRIX.WIDTH / 2; x++) {
                const temp = current[y][x]
                current[y][x] = current[y][LED_MATRIX.WIDTH - 1 - x]
                current[y][LED_MATRIX.WIDTH - 1 - x] = temp
            }
        }

        this.setMatrix(current)
    }

    /**
     * Flip the display vertically
     */
    flipVertical(): void {
        this.ensureInitialized()
        const current = this.getMatrix()

        for (let y = 0; y < LED_MATRIX.HEIGHT / 2; y++) {
            const temp = current[y]
            current[y] = current[LED_MATRIX.HEIGHT - 1 - y]
            current[LED_MATRIX.HEIGHT - 1 - y] = temp
        }

        this.setMatrix(current)
    }

    /**
     * Update the physical LED display with framebuffer contents
     */
    private updateDisplay(): void {
        if (this.fbDevice === null) {
            throw new Error('Framebuffer device not initialized')
        }

        try {
            // Write the entire framebuffer to /dev/fb0
            writeSync(this.fbDevice, this.framebuffer, 0, LED_MATRIX.FRAMEBUFFER_SIZE, 0)
        } catch (error) {
            throw new Error(
                `Failed to update display: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    /**
     * Validate that the matrix has been initialized
     */
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('LedMatrix not initialized. Call initialize() first.')
        }
    }

    /**
     * Validate pixel position is within bounds
     */
    private validatePosition(position: Position): void {
        if (
            position.x < 0 ||
            position.x >= LED_MATRIX.WIDTH ||
            position.y < 0 ||
            position.y >= LED_MATRIX.HEIGHT
        ) {
            throw new Error(
                `Position out of bounds: (${position.x}, ${position.y}). Valid range: 0-${LED_MATRIX.WIDTH - 1}, 0-${LED_MATRIX.HEIGHT - 1}`
            )
        }
    }

    /**
     * Apply rotation transformation to position
     */
    private applyRotation(position: Position): Position {
        const { x, y } = position

        switch (this.rotation) {
            case Rotation.ROTATE_90:
                return { x: LED_MATRIX.WIDTH - 1 - y, y: x }
            case Rotation.ROTATE_180:
                return {
                    x: LED_MATRIX.WIDTH - 1 - x,
                    y: LED_MATRIX.HEIGHT - 1 - y,
                }
            case Rotation.ROTATE_270:
                return { x: y, y: LED_MATRIX.HEIGHT - 1 - x }
            default:
                return { x, y }
        }
    }

    /**
     * Apply low-light mode to color if enabled
     */
    private applyLowLight(color: RGB): RGB {
        if (!this.lowLight) {
            return color
        }

        return {
            r: Math.floor(color.r / 8),
            g: Math.floor(color.g / 8),
            b: Math.floor(color.b / 8),
        }
    }
}
