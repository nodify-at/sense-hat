import { BaseSensor } from '../../core/base-sensor.js'
import { I2CDeviceImpl } from '../../core/i2c-device.js'
import type { Vector3D } from '@nodify-at/types'

/**
 * Accelerometer sensor
 * Sensor: LSM9DS1 (IMU - accelerometer/gyroscope)
 */
export class AccelerometerSensor extends BaseSensor<Vector3D> {
    private static readonly ADDRESS = 0x6a
    private static readonly CTRL_REG6_XL = 0x20
    private static readonly OUT_X_L_XL = 0x28

    private i2c?: I2CDeviceImpl
    private readonly busNumber: number
    private readonly scale: number

    constructor(busNumber = 1, scale: 2 | 4 | 8 | 16 = 2) {
        super()
        this.busNumber = busNumber
        this.scale = scale / 32768.0 // Convert to g's
    }

    async close(): Promise<void> {
        if (this.i2c) {
            await this.i2c.close()
            this.i2c = undefined
        }
    }

    protected async initialize(): Promise<void> {
        this.i2c = await I2CDeviceImpl.create(this.busNumber, AccelerometerSensor.ADDRESS)

        // Configure: 119Hz ODR, ±2g scale, enable all axes
        await this.i2c.writeByte(AccelerometerSensor.CTRL_REG6_XL, 0x60)

        await new Promise((resolve) => setTimeout(resolve, 50))
    }

    protected async readValue(): Promise<Vector3D> {
        if (!this.i2c) {
            throw new Error('Sensor not initialized')
        }

        // Read 6 bytes (X, Y, Z - each 16-bit)
        const buffer = await this.i2c.readI2cBlock(AccelerometerSensor.OUT_X_L_XL | 0x80, 6)

        const x = buffer.readInt16LE(0) * this.scale
        const y = buffer.readInt16LE(2) * this.scale
        const z = buffer.readInt16LE(4) * this.scale

        return { x, y, z }
    }
}
