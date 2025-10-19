import type { Sensor } from '@nodify-at/types'
import { AsyncLazy } from '../utils/async-lazy.js'

/**
 * Base class for all sensors with lazy initialization
 */
export abstract class BaseSensor<T> implements Sensor<T> {
    private readonly lazyInit: AsyncLazy<void>

    protected constructor() {
        this.lazyInit = new AsyncLazy(() => this.initialize())
    }

    /**
     * Initialize the sensor (called once automatically on first read)
     */
    async init(): Promise<void> {
        await this.lazyInit.getValue()
    }

    /**
     * Check if the sensor is initialized
     */
    isInitialized(): boolean {
        return this.lazyInit.isInitialized()
    }

    /**
     * Read sensor value (initializes automatically if needed)
     */
    async read(): Promise<T> {
        await this.init()
        return this.readValue()
    }

    /**
     * Clean up resources
     */
    abstract close(): Promise<void>

    /**
     * Actual initialization logic (implemented by derived classes)
     */
    protected abstract initialize(): Promise<void>

    /**
     * Actual read logic (implemented by derived classes)
     */
    protected abstract readValue(): Promise<T>
}
