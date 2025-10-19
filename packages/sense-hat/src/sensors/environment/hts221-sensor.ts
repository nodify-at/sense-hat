import { BaseSensor } from '../../core/base-sensor.js'
import { I2CDeviceImpl } from '../../core/i2c-device.js'
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * HTS221 Humidity and Temperature sensor over I2C
 * This sensor provides both temperature and humidity readings
 */
export class HTS221Sensor extends BaseSensor<{ temperature: number; humidity: number }> {
    private static readonly ADDRESS = 0x5f
    private static readonly WHO_AM_I = 0x0f
    private static readonly WHO_AM_I_VALUE = 0xbc
    private static readonly CTRL_REG1 = 0x20
    private static readonly STATUS_REG = 0x27

    // Calibration registers
    private static readonly H0_RH_X2 = 0x30
    private static readonly H1_RH_X2 = 0x31
    private static readonly T0_DEGC_X8 = 0x32
    private static readonly T1_DEGC_X8 = 0x33
    private static readonly T1_T0_MSB = 0x35
    private static readonly H0_T0_OUT = 0x36
    private static readonly H1_T0_OUT = 0x3a
    private static readonly T0_OUT = 0x3c
    private static readonly T1_OUT = 0x3e

    // Data output registers
    private static readonly HUMIDITY_OUT_L = 0x28
    private static readonly TEMP_OUT_L = 0x2a

    private i2c?: I2CDeviceImpl
    private readonly busNumber: number

    // Calibration values for linear interpolation
    private humidityCalPoint0 = 0 // H0_rH - humidity calibration point 0 (%)
    private humidityCalPoint1 = 0 // H1_rH - humidity calibration point 1 (%)
    private humidityRawCalPoint0 = 0 // H0_T0_OUT - raw ADC value at calibration point 0
    private humidityRawCalPoint1 = 0 // H1_T0_OUT - raw ADC value at calibration point 1
    private tempCalPoint0 = 0 // T0_degC - temperature calibration point 0 (°C)
    private tempCalPoint1 = 0 // T1_degC - temperature calibration point 1 (°C)
    private tempRawCalPoint0 = 0 // T0_OUT - raw ADC value at calibration point 0
    private tempRawCalPoint1 = 0 // T1_OUT - raw ADC value at calibration point 1

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
        this.i2c = await I2CDeviceImpl.create(this.busNumber, HTS221Sensor.ADDRESS)

        // Verify device ID
        const whoAmI = await this.i2c.readByte(HTS221Sensor.WHO_AM_I)
        if (whoAmI !== HTS221Sensor.WHO_AM_I_VALUE) {
            throw new Error(`Invalid HTS221 device ID: 0x${whoAmI.toString(16)}`)
        }

        // Read calibration data
        await this.readCalibration()

        // Power on and enable block data update, set output data rate to 1Hz
        await this.i2c.writeByte(HTS221Sensor.CTRL_REG1, 0x85)

        await sleep(100)
    }

    protected async readValue(): Promise<{ temperature: number; humidity: number }> {
        if (!this.i2c) {
            throw new Error('Sensor not initialized')
        }

        // Wait for data ready
        let status = 0
        let retries = 0
        while (!(status & 0x03) && retries < 10) {
            status = await this.i2c.readByte(HTS221Sensor.STATUS_REG)
            if (!(status & 0x03)) {
                await new Promise((resolve) => setTimeout(resolve, 10))
                retries++
            }
        }

        // Read humidity (16-bit signed)
        const humidityLow = await this.i2c.readByte(HTS221Sensor.HUMIDITY_OUT_L)
        const humidityHigh = await this.i2c.readByte(HTS221Sensor.HUMIDITY_OUT_L + 1)
        const humidityRaw = this.toSigned16(humidityLow | (humidityHigh << 8))

        // Read temperature (16-bit signed)
        const tempLow = await this.i2c.readByte(HTS221Sensor.TEMP_OUT_L)
        const tempHigh = await this.i2c.readByte(HTS221Sensor.TEMP_OUT_L + 1)
        const tempRaw = this.toSigned16(tempLow | (tempHigh << 8))

        // Calculate humidity using linear interpolation between two calibration points
        const humidity =
            this.humidityCalPoint0 +
            ((this.humidityCalPoint1 - this.humidityCalPoint0) *
                (humidityRaw - this.humidityRawCalPoint0)) /
                (this.humidityRawCalPoint1 - this.humidityRawCalPoint0)

        // Calculate temperature using linear interpolation between two calibration points
        const temperature =
            this.tempCalPoint0 +
            ((this.tempCalPoint1 - this.tempCalPoint0) * (tempRaw - this.tempRawCalPoint0)) /
                (this.tempRawCalPoint1 - this.tempRawCalPoint0)

        return {
            temperature: Math.max(0, Math.min(100, temperature)),
            humidity: Math.max(0, Math.min(100, humidity)),
        }
    }

    private async readCalibration(): Promise<void> {
        if (!this.i2c) throw new Error('I2C not initialized')

        // Read humidity calibration points (stored as 2x actual value)
        this.humidityCalPoint0 = (await this.i2c.readByte(HTS221Sensor.H0_RH_X2)) / 2.0
        this.humidityCalPoint1 = (await this.i2c.readByte(HTS221Sensor.H1_RH_X2)) / 2.0

        // Read raw ADC output at humidity calibration point 0
        const h0OutLow = await this.i2c.readByte(HTS221Sensor.H0_T0_OUT)
        const h0OutHigh = await this.i2c.readByte(HTS221Sensor.H0_T0_OUT + 1)
        this.humidityRawCalPoint0 = this.toSigned16(h0OutLow | (h0OutHigh << 8))

        // Read raw ADC output at humidity calibration point 1
        const h1OutLow = await this.i2c.readByte(HTS221Sensor.H1_T0_OUT)
        const h1OutHigh = await this.i2c.readByte(HTS221Sensor.H1_T0_OUT + 1)
        this.humidityRawCalPoint1 = this.toSigned16(h1OutLow | (h1OutHigh << 8))

        // Read temperature calibration points (stored as 8x actual value)
        const temp0x8 = await this.i2c.readByte(HTS221Sensor.T0_DEGC_X8)
        const temp1x8 = await this.i2c.readByte(HTS221Sensor.T1_DEGC_X8)
        const tempMsbBits = await this.i2c.readByte(HTS221Sensor.T1_T0_MSB)

        // Reconstruct 10-bit temperature values (lower 8 bits + upper 2 bits from MSB register)
        const temp0x8Full = temp0x8 | ((tempMsbBits & 0x03) << 8)
        const temp1x8Full = temp1x8 | ((tempMsbBits & 0x0c) << 6)

        this.tempCalPoint0 = temp0x8Full / 8.0
        this.tempCalPoint1 = temp1x8Full / 8.0

        // Read raw ADC output at temperature calibration point 0
        const t0OutLow = await this.i2c.readByte(HTS221Sensor.T0_OUT)
        const t0OutHigh = await this.i2c.readByte(HTS221Sensor.T0_OUT + 1)
        this.tempRawCalPoint0 = this.toSigned16(t0OutLow | (t0OutHigh << 8))

        // Read raw ADC output at temperature calibration point 1
        const t1OutLow = await this.i2c.readByte(HTS221Sensor.T1_OUT)
        const t1OutHigh = await this.i2c.readByte(HTS221Sensor.T1_OUT + 1)
        this.tempRawCalPoint1 = this.toSigned16(t1OutLow | (t1OutHigh << 8))
    }

    private toSigned16(value: number): number {
        return value > 32767 ? value - 65536 : value
    }
}
