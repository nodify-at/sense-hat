import { BaseSensor } from '../../core/base-sensor.js'
import { I2CDeviceImpl } from '../../core/i2c-device.js'

/**
 * Barometric pressure sensor
 * Sensor: LPS25H
 */
export class PressureSensor extends BaseSensor<number> {
    private static readonly ADDRESS = 0x5c
    private static readonly CTRL_REG1 = 0x20
    private static readonly PRESS_OUT_XL = 0x28

    private i2c?: I2CDeviceImpl
    private readonly busNumber: number

    constructor(busNumber = 1) {
        super()
        this.busNumber = busNumber
    }

    async close(): Promise<void> {
        if (this.i2c) {
            await this.i2c.close()
            this.i2c = undefined
        }
    }

    protected async initialize(): Promise<void> {
        this.i2c = await I2CDeviceImpl.create(this.busNumber, PressureSensor.ADDRESS)

        // Power on and set the output data rate (25Hz)
        await this.i2c.writeByte(PressureSensor.CTRL_REG1, 0xc0)

        // Wait for the sensor to stabilize
        await new Promise((resolve) => setTimeout(resolve, 50))
    }

    protected async readValue(): Promise<number> {
        if (!this.i2c) {
            throw new Error('Sensor not initialized')
        }

        // Read 3 bytes (24-bit pressure value)
        const buffer = await this.i2c.readI2cBlock(PressureSensor.PRESS_OUT_XL | 0x80, 3)

        // Combine bytes into a 24-bit value
        const pressureRaw = buffer[0] | (buffer[1] << 8) | (buffer[2] << 16)

        // Convert to hPa (hectopascals/millibars)
        return pressureRaw / 4096.0
    }
}
