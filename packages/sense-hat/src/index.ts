// LED Matrix
export { LedMatrix } from './led/index.js'

// Types
export type { RGB, Position, Pixel, LEDMatrixConfig } from './types/index.js'
export { LED_MATRIX, Colors, Rotation } from './types/index.js'

// Utilities
export { validateRGB, rgbToRGB565, rgb565ToRGB, colorFromHex, rgbToHex } from './utils/index.js'

// === SENSORS ===

// Main Sense HAT class
export { SenseHat } from './sense-hat.js'
export type { SenseHatConfig } from './sense-hat.js'

// Sensor types
export type {
    Vector3D,
    SensorReading,
    EnvironmentData,
    MotionData,
    AllSensorData,
    Sensor,
    I2CDevice,
} from './types/index.js'

// Individual sensors for advanced use
export { HTS221Sensor } from './sensors/environment/hts221-sensor.js'
export { PressureSensor } from './sensors/environment/pressure-sensor.js'
export { AccelerometerSensor } from './sensors/motion/accelerometer-sensor.js'
export { GyroscopeSensor } from './sensors/motion/gyroscope-sensor.js'
export { MagnetometerSensor } from './sensors/motion/magnetometer-sensor.js'

// Core classes for custom implementations
export { BaseSensor } from './core/base-sensor.js'
export { I2CDeviceImpl } from './core/i2c-device.js'

// I2C Discovery utilities
export {
    scanI2CBus,
    discoverSenseHatDevices,
    isDevicePresent,
    KNOWN_DEVICES,
} from './utils/i2c-discovery.js'
export type { I2CDeviceInfo } from './utils/i2c-discovery.js'

// Utilities
export { AsyncLazy } from './utils/async-lazy.js'
