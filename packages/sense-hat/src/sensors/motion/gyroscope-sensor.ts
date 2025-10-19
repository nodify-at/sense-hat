import { BaseSensor } from '../../core/base-sensor.js'
import { I2CDeviceImpl } from '../../core/i2c-device.js'
import type { Vector3D } from '@nodify-at/types'

/**
 * Gyroscope sensor
 * Sensor: LSM9DS1 (IMU - accelerometer/gyroscope)
 */
export class GyroscopeSensor extends BaseSensor<Vector3D> {
    private static readonly ADDRESS = 0x6a
    private static readonly CTRL_REG1_G = 0x10
    private static readonly OUT_X_L_G = 0x18

    private i2c?: I2CDeviceImpl
    private readonly busNumber: number
    private readonly scale: number

    constructor(busNumber = 1, scale: 245 | 500 | 2000 = 245) {
        super()
        this.busNumber = busNumber
        // Convert to degrees per second (dps)
        this.scale = scale / 32768.0
    }

    async close(): Promise<void> {
        if (this.i2c) {
            await this.i2c.close()
            this.i2c = undefined
        }
    }

    protected async initialize(): Promise<void> {
        this.i2c = await I2CDeviceImpl.create(this.busNumber, GyroscopeSensor.ADDRESS)

        // Configure: 119Hz ODR, 245 dps scale
        await this.i2c.writeByte(GyroscopeSensor.CTRL_REG1_G, 0x60)

        await new Promise((resolve) => setTimeout(resolve, 50))
    }

    protected async readValue(): Promise<Vector3D> {
        if (!this.i2c) {
            throw new Error('Sensor not initialized')
        }

        // Read 6 bytes (X, Y, Z - each 16-bit)
        const buffer = await this.i2c.readI2cBlock(GyroscopeSensor.OUT_X_L_G | 0x80, 6)

        const x = buffer.readInt16LE(0) * this.scale
        const y = buffer.readInt16LE(2) * this.scale
        const z = buffer.readInt16LE(4) * this.scale

        return { x, y, z }
    }
}
