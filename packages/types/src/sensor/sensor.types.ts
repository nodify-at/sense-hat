/**
 * Base sensor interface
 */
export interface Sensor<T> {
    /**
     * Initialize the sensor
     */
    init(): Promise<void>

    /**
     * Read sensor data
     */
    read(): Promise<T>

    /**
     * Close and cleanup sensor resources
     */
    close(): Promise<void>

    /**
     * Check if sensor is initialized
     */
    isInitialized(): boolean
}

/**
 * Sensor configuration options
 */
export interface SensorOptions {
    enabled?: boolean
}
