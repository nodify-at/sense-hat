import { HTS221Sensor } from './sensors/environment/hts221-sensor.js'
import { PressureSensor } from './sensors/environment/pressure-sensor.js'
import { AccelerometerSensor } from './sensors/motion/accelerometer-sensor.js'
import { GyroscopeSensor } from './sensors/motion/gyroscope-sensor.js'
import { MagnetometerSensor } from './sensors/motion/magnetometer-sensor.js'
import type { AllSensorData, Vector3D } from '@nodify-at/types'

export interface SenseHatConfig {
    i2cBusNumber?: number
}

/**
 * Main SenseHat class - Facade pattern for all sensors
 * Provides a simple, unified interface to all Sense HAT sensors
 */
export class SenseHat {
    private readonly hts221: HTS221Sensor
    private readonly pressure: PressureSensor
    private readonly accelerometer: AccelerometerSensor
    private readonly gyroscope: GyroscopeSensor
    private readonly magnetometer: MagnetometerSensor

    constructor(config: SenseHatConfig = {}) {
        const { i2cBusNumber = 1 } = config

        // Environment sensors (I2C-based)
        this.hts221 = new HTS221Sensor(i2cBusNumber)
        this.pressure = new PressureSensor(i2cBusNumber)

        // Motion sensors (I2C-based)
        this.accelerometer = new AccelerometerSensor(i2cBusNumber)
        this.gyroscope = new GyroscopeSensor(i2cBusNumber)
        this.magnetometer = new MagnetometerSensor(i2cBusNumber)
    }

    /**
     * Get temperature in Celsius
     */
    async getTemperature(): Promise<number> {
        const data = await this.hts221.read()
        return data.temperature
    }

    /**
     * Get relative humidity percentage
     */
    async getHumidity(): Promise<number> {
        const data = await this.hts221.read()
        return data.humidity
    }

    /**
     * Get barometric pressure in hPa (hectopascals/millibars)
     */
    async getPressure(): Promise<number> {
        return this.pressure.read()
    }

    /**
     * Get accelerometer reading in g's
     */
    async getAccelerometer(): Promise<Vector3D> {
        return this.accelerometer.read()
    }

    /**
     * Get gyroscope reading in degrees per second
     */
    async getGyroscope(): Promise<Vector3D> {
        return this.gyroscope.read()
    }

    /**
     * Get magnetometer reading in gauss
     */
    async getMagnetometer(): Promise<Vector3D> {
        return this.magnetometer.read()
    }

    /**
     * Get orientation (pitch, roll, yaw) in degrees
     * Calculated from accelerometer and magnetometer
     */
    async getOrientation(): Promise<{ pitch: number; roll: number; yaw: number }> {
        const accel = await this.accelerometer.read()
        const mag = await this.magnetometer.read()

        // Calculate pitch and roll from accelerometer
        const pitch = Math.atan2(accel.y, Math.sqrt(accel.x ** 2 + accel.z ** 2))
        const roll = Math.atan2(-accel.x, accel.z)

        // Calculate yaw from magnetometer (tilt-compensated)
        const magX = mag.x * Math.cos(pitch) + mag.z * Math.sin(pitch)
        const magY =
            mag.x * Math.sin(roll) * Math.sin(pitch) +
            mag.y * Math.cos(roll) -
            mag.z * Math.sin(roll) * Math.cos(pitch)
        const yaw = Math.atan2(-magY, magX)

        // Convert to degrees
        return {
            pitch: (pitch * 180) / Math.PI,
            roll: (roll * 180) / Math.PI,
            yaw: (yaw * 180) / Math.PI,
        }
    }

    /**
     * Get all environment sensor readings
     */
    async getEnvironmentData(): Promise<{
        temperature: number
        humidity: number
        pressure: number
    }> {
        const [temperature, humidity, pressure] = await Promise.all([
            this.getTemperature(),
            this.getHumidity(),
            this.getPressure(),
        ])

        return { temperature, humidity, pressure }
    }

    /**
     * Get all motion sensor readings
     */
    async getMotionData(): Promise<{
        accelerometer: Vector3D
        gyroscope: Vector3D
        magnetometer: Vector3D
        orientation: { pitch: number; roll: number; yaw: number }
    }> {
        const [accelerometer, gyroscope, magnetometer, orientation] = await Promise.all([
            this.getAccelerometer(),
            this.getGyroscope(),
            this.getMagnetometer(),
            this.getOrientation(),
        ])

        return { accelerometer, gyroscope, magnetometer, orientation }
    }

    /**
     * Get all sensor readings at once
     */
    async getAllSensors(): Promise<AllSensorData> {
        const [envData, motionData] = await Promise.all([
            this.getEnvironmentData(),
            this.getMotionData(),
        ])

        return {
            ...envData,
            ...motionData,
        }
    }

    /**
     * Close all sensor connections
     */
    async close(): Promise<void> {
        await Promise.all([
            this.hts221.close(),
            this.pressure.close(),
            this.accelerometer.close(),
            this.gyroscope.close(),
            this.magnetometer.close(),
        ])
    }
}
