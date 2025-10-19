/**
 * RGB color representation with values from 0-255
 */
export interface RGB {
    r: number
    g: number
    b: number
}

/**
 * Position on the 8x8 LED matrix
 */
export interface Position {
    x: number
    y: number
}

/**
 * Pixel data combining position and color
 */
export interface Pixel {
    position: Position
    color: RGB
}

/**
 * Configuration options for LED matrix
 */
export interface LEDMatrixConfig {
    i2cBus?: number
    lowLight?: boolean
    rotation?: Rotation
}

/**
 * Rotation angles for the display
 */
export enum Rotation {
    ROTATE_0 = 0,
    ROTATE_90 = 90,
    ROTATE_180 = 180,
    ROTATE_270 = 270,
}
