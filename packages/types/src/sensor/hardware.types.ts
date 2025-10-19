/**
 * I2C device interface
 */
export interface I2CDevice {
    writeByte(register: number, value: number): Promise<void>
    readByte(register: number): Promise<number>
    readI2cBlock(register: number, length: number): Promise<Buffer>
    close(): Promise<void>
}

/**
 * I2C device configuration
 */
export interface I2CConfig {
    bus: number
    address: number
}

/**
 * IIO channel configuration
 */
export interface IIOChannel {
    name: string
    deviceNumber: number
}
