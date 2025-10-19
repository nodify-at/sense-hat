import { BaseSensor } from '../../core/base-sensor.js'
import { I2CDeviceImpl } from '../../core/i2c-device.js'
import type { Vector3D } from '@nodify-at/types'

/**
 * Magnetometer (compass) sensor
 * Sensor: LSM9DS1 (magnetometer)
 */
export class MagnetometerSensor extends BaseSensor<Vector3D> {
    private static readonly ADDRESS = 0x1c
    private static readonly CTRL_REG1_M = 0x20
    private static readonly CTRL_REG2_M = 0x21
    private static readonly CTRL_REG3_M = 0x22
    private static readonly OUT_X_L_M = 0x28

    private i2c?: I2CDeviceImpl
    private readonly busNumber: number
    private readonly scale: number

    constructor(busNumber = 1, scale: 4 | 8 | 12 | 16 = 4) {
        super()
        this.busNumber = busNumber
        // Convert to gauss
        this.scale = scale / 32768.0
    }

    async close(): Promise<void> {
        if (this.i2c) {
            await this.i2c.close()
            this.i2c = undefined
        }
    }

    protected async initialize(): Promise<void> {
        this.i2c = await I2CDeviceImpl.create(this.busNumber, MagnetometerSensor.ADDRESS)

        // Configure: Temperature compensation enabled, high-performance mode, 80Hz ODR
        await this.i2c.writeByte(MagnetometerSensor.CTRL_REG1_M, 0xfc)

        // ±4 gauss scale
        await this.i2c.writeByte(MagnetometerSensor.CTRL_REG2_M, 0x00)

        // Continuous conversion mode
        await this.i2c.writeByte(MagnetometerSensor.CTRL_REG3_M, 0x00)

        await new Promise((resolve) => setTimeout(resolve, 50))
    }

    protected async readValue(): Promise<Vector3D> {
        if (!this.i2c) {
            throw new Error('Sensor not initialized')
        }

        // Read 6 bytes (X, Y, Z - each 16-bit)
        const buffer = await this.i2c.readI2cBlock(MagnetometerSensor.OUT_X_L_M | 0x80, 6)

        const x = buffer.readInt16LE(0) * this.scale
        const y = buffer.readInt16LE(2) * this.scale
        const z = buffer.readInt16LE(4) * this.scale

        return { x, y, z }
    }
}
