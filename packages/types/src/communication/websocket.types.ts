import type { Vector3D } from '../sensor/data.types.js'

/**
 * WebSocket connection status
 */
export interface ConnectionStatus {
    message: string
    senseHatAvailable: boolean
}

/**
 * Sensor data transmitted over WebSocket
 */
export interface SensorData {
    timestamp: number
    temperature: number
    humidity: number
    pressure: number
    accelerometer: Vector3D
    gyroscope: Vector3D
    magnetometer: Vector3D
}
