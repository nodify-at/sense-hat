import type { RGB } from '@nodify-at/types'
import type { LedMatrix } from '@nodify-at/sense-hat'
import { clearInterval } from 'node:timers'
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * Options for text rendering
 */
export interface TextRenderOptions {
    scrollSpeed?: number
    textColor?: RGB
    backColor?: RGB
}

/**
 * 5x8 bitmap font for LED matrix display
 */
const FONT: Record<string, number[]> = {
    A: [0x7c, 0x12, 0x11, 0x12, 0x7c],
    B: [0x7f, 0x49, 0x49, 0x49, 0x36],
    C: [0x3e, 0x41, 0x41, 0x41, 0x22],
    D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
    E: [0x7f, 0x49, 0x49, 0x49, 0x41],
    F: [0x7f, 0x09, 0x09, 0x09, 0x01],
    G: [0x3e, 0x41, 0x49, 0x49, 0x7a],
    H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
    I: [0x00, 0x41, 0x7f, 0x41, 0x00],
    J: [0x20, 0x40, 0x41, 0x3f, 0x01],
    K: [0x7f, 0x08, 0x14, 0x22, 0x41],
    L: [0x7f, 0x40, 0x40, 0x40, 0x40],
    M: [0x7f, 0x02, 0x0c, 0x02, 0x7f],
    N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
    O: [0x3e, 0x41, 0x41, 0x41, 0x3e],
    P: [0x7f, 0x09, 0x09, 0x09, 0x06],
    Q: [0x3e, 0x41, 0x51, 0x21, 0x5e],
    R: [0x7f, 0x09, 0x19, 0x29, 0x46],
    S: [0x46, 0x49, 0x49, 0x49, 0x31],
    T: [0x01, 0x01, 0x7f, 0x01, 0x01],
    U: [0x3f, 0x40, 0x40, 0x40, 0x3f],
    V: [0x1f, 0x20, 0x40, 0x20, 0x1f],
    W: [0x3f, 0x40, 0x38, 0x40, 0x3f],
    X: [0x63, 0x14, 0x08, 0x14, 0x63],
    Y: [0x07, 0x08, 0x70, 0x08, 0x07],
    Z: [0x61, 0x51, 0x49, 0x45, 0x43],
    ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
    '!': [0x00, 0x00, 0x5f, 0x00, 0x00],
    '?': [0x02, 0x01, 0x51, 0x09, 0x06],
    '0': [0x3e, 0x51, 0x49, 0x45, 0x3e],
    '1': [0x00, 0x42, 0x7f, 0x40, 0x00],
    '2': [0x42, 0x61, 0x51, 0x49, 0x46],
    '3': [0x21, 0x41, 0x45, 0x4b, 0x31],
    '4': [0x18, 0x14, 0x12, 0x7f, 0x10],
    '5': [0x27, 0x45, 0x45, 0x45, 0x39],
    '6': [0x3c, 0x4a, 0x49, 0x49, 0x30],
    '7': [0x01, 0x71, 0x09, 0x05, 0x03],
    '8': [0x36, 0x49, 0x49, 0x49, 0x36],
    '9': [0x06, 0x49, 0x49, 0x29, 0x1e],
}

/**
 * Text rendering and scrolling for LED Matrix displays
 *
 * Handles bitmap font rendering and smooth text scrolling animations
 * for 8x8 LED matrices.
 *
 */
export class LedTextRenderer {
    private readonly LED_SIZE = 8
    private readonly CHAR_WIDTH = 5
    private readonly CHAR_SPACING = 1
    private scrollInterval: NodeJS.Timeout | undefined

    constructor(private readonly ledMatrix: LedMatrix) {}

    /**
     * Display and scroll a text message across the LED matrix
     */
    async showMessage(text: string, options: TextRenderOptions = {}): Promise<void> {
        const {
            scrollSpeed = 0.1,
            textColor = { r: 255, g: 255, b: 255 },
            backColor = { r: 0, g: 0, b: 0 },
        } = options

        if (this.scrollInterval) {
            clearInterval(this.scrollInterval)
            await sleep(1000)
        }
        this.ledMatrix.clear()

        // Convert text to uppercase and filter supported characters
        const displayText = text
            .toUpperCase()
            .split('')
            .filter((char) => FONT[char])

        if (displayText.length === 0) {
            return
        }

        // Build the complete scrollable bitmap
        const fullBitmap = this.buildScrollBitmap(displayText, textColor, backColor)
        const totalWidth = fullBitmap[0].length

        // Scroll the message
        await this.scrollBitmap(fullBitmap, totalWidth, scrollSpeed, backColor)
    }

    /**
     * Build a complete bitmap for scrolling text
     */
    private buildScrollBitmap(displayText: string[], textColor: RGB, backColor: RGB): RGB[][] {
        // Initialize 8 rows
        const bitmap: RGB[][] = Array.from({ length: this.LED_SIZE }, () => [])

        // Add leading padding (8 columns)
        this.addPadding(bitmap, this.LED_SIZE, backColor)

        // Build bitmap from characters
        for (const char of displayText) {
            const charData = FONT[char]
            this.addCharacterToBitmap(bitmap, charData, textColor, backColor)
            // Add spacing between characters
            this.addPadding(bitmap, this.CHAR_SPACING, backColor)
        }

        // Add trailing padding (8 columns)
        this.addPadding(bitmap, this.LED_SIZE, backColor)

        return bitmap
    }

    /**
     * Add a character to the bitmap
     */
    private addCharacterToBitmap(
        bitmap: RGB[][],
        charData: number[],
        textColor: RGB,
        backColor: RGB
    ): void {
        // Each character is 5 columns wide
        for (let col = 0; col < this.CHAR_WIDTH; col++) {
            const columnByte = charData[col]

            // Process each row
            for (let row = 0; row < this.LED_SIZE; row++) {
                const isPixelOn = (columnByte >> row) & 1
                bitmap[row].push(isPixelOn ? textColor : backColor)
            }
        }
    }

    /**
     * Add padding columns to the bitmap
     */
    private addPadding(bitmap: RGB[][], columns: number, color: RGB): void {
        for (let i = 0; i < columns; i++) {
            for (let row = 0; row < this.LED_SIZE; row++) {
                bitmap[row].push(color)
            }
        }
    }

    /**
     * Scroll the bitmap across the LED matrix
     */
    private scrollBitmap(
        fullBitmap: RGB[][],
        totalWidth: number,
        scrollSpeed: number,
        backColor: RGB
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let offset = 0
            const delayMs = Math.max(10, scrollSpeed * 1000)

            this.scrollInterval = setInterval(() => {
                try {
                    // Extract 8x8 frame from the full bitmap
                    const frame = this.extractFrame(fullBitmap, offset, totalWidth, backColor)
                    this.ledMatrix.setMatrix(frame)
                    offset++

                    if (offset >= totalWidth) {
                        clearInterval(this.scrollInterval)
                        this.ledMatrix.clear()
                        resolve()
                    }
                } catch (error) {
                    clearInterval(this.scrollInterval)
                    reject(error as Error)
                }
            }, delayMs)
        })
    }

    /**
     * Extract a 8x8 frame from the full bitmap at the given offset
     */
    private extractFrame(
        fullBitmap: RGB[][],
        offset: number,
        totalWidth: number,
        backColor: RGB
    ): RGB[][] {
        const frame: RGB[][] = []
        for (let row = 0; row < this.LED_SIZE; row++) {
            const frameRow: RGB[] = []
            for (let col = 0; col < this.LED_SIZE; col++) {
                const index = offset + col
                frameRow.push(index >= 0 && index < totalWidth ? fullBitmap[row][index] : backColor)
            }
            frame.push(frameRow)
        }
        return frame
    }
}
