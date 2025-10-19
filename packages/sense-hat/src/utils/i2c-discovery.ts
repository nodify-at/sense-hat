import * as i2c from 'i2c-bus'

/**
 * Known I2C device addresses for Sense HAT sensors
 */
export const KNOWN_DEVICES = {
    HTS221: 0x5f, // Humidity & Temperature sensor
    LPS25H: 0x5c, // Pressure sensor
    LSM9DS1_AG: 0x6a, // Accelerometer & Gyroscope (alternative: 0x6b)
    LSM9DS1_M: 0x1c, // Magnetometer (alternative: 0x1e)
    LED_MATRIX: 0x46, // LED matrix driver
}

export interface I2CDeviceInfo {
    address: number
    name?: string
}

/**
 * Scan I2C bus for connected devices
 * @param busNumber I2C bus number (default: 1)
 * @returns Array of detected device addresses
 */
export async function scanI2CBus(busNumber = 1): Promise<number[]> {
    const bus = await i2c.openPromisified(busNumber)
    const devices: number[] = []

    try {
        // Scan addresses 0x03 to 0x77 (valid I2C range)
        for (let addr = 0x03; addr <= 0x77; addr++) {
            try {
                // Try to read a byte to check if device responds
                await bus.receiveByte(addr)
                devices.push(addr)
            } catch {
                // Device not present at this address
            }
        }
    } finally {
        await bus.close()
    }

    return devices
}

/**
 * Identify known Sense HAT devices on the I2C bus
 * @param busNumber I2C bus number (default: 1)
 * @returns Array of identified devices with names
 */
export async function discoverSenseHatDevices(busNumber = 1): Promise<I2CDeviceInfo[]> {
    const addresses = await scanI2CBus(busNumber)
    const knownDeviceMap = new Map(
        Object.entries(KNOWN_DEVICES).map(([name, addr]) => [addr, name])
    )

    return addresses.map((address) => ({
        address,
        name: knownDeviceMap.get(address),
    }))
}

/**
 * Check if a specific device is present on the I2C bus
 * @param address I2C device address
 * @param busNumber I2C bus number (default: 1)
 * @returns true if device is present
 */
export async function isDevicePresent(address: number, busNumber = 1): Promise<boolean> {
    const bus = await i2c.openPromisified(busNumber)
    try {
        await bus.receiveByte(address)
        return true
    } catch {
        return false
    } finally {
        await bus.close()
    }
}
