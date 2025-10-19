/**
 * 3D vector for motion sensors
 */
export interface Vector3D {
    x: number
    y: number
    z: number
}

/**
 * Orientation data combining pitch, roll, and yaw
 */
export interface Orientation {
    pitch: number
    roll: number
    yaw: number
}

/**
 * Environmental sensor data
 */
export interface EnvironmentData {
    temperature?: number
    humidity?: number
    pressure?: number
}

/**
 * Motion sensor data
 */
export interface MotionData {
    gyroscope?: Vector3D
    accelerometer?: Vector3D
    magnetometer?: Vector3D
    orientation?: Orientation
}

/**
 * Combined sensor data from all sensors
 */
export interface AllSensorData extends EnvironmentData, MotionData {
    light?: number
    color?: {
        r: number
        g: number
        b: number
    }
}

/**
 * Generic sensor reading wrapper with metadata
 */
export interface SensorReading<T> {
    value: T
    timestamp: Date
    valid: boolean
}

/**
 * Environmental sensor reading with units
 */
export interface EnvironmentalReading {
    temperature: number
    humidity: number
    pressure: number
}

/**
 * IMU (Inertial Measurement Unit) sensor reading
 */
export interface IMUReading {
    accelerometer: Vector3D
    gyroscope: Vector3D
    magnetometer: Vector3D
}
