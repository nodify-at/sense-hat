import i2c from 'i2c-bus'
import type { I2CDevice } from '@nodify-at/types'

/**
 * I2C device implementation using i2c-bus library
 */
export class I2CDeviceImpl implements I2CDevice {
    private constructor(
        private readonly bus: i2c.PromisifiedBus,
        private readonly address: number
    ) {}

    static async create(busNumber: number, address: number): Promise<I2CDeviceImpl> {
        const bus = await i2c.openPromisified(busNumber)
        return new I2CDeviceImpl(bus, address)
    }

    async writeByte(register: number, value: number): Promise<void> {
        await this.bus.writeByte(this.address, register, value)
    }

    async readByte(register: number): Promise<number> {
        return this.bus.readByte(this.address, register)
    }

    async readI2cBlock(register: number, length: number): Promise<Buffer> {
        const buffer = Buffer.alloc(length)
        const result = await this.bus.readI2cBlock(this.address, register, length, buffer)
        return result.buffer
    }

    async close(): Promise<void> {
        await this.bus.close()
    }
}
