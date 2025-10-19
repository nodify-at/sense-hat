/**
 * Lazy initialization wrapper for async resources
 * Ensures single initialization even with concurrent calls
 */
export class AsyncLazy<T> {
    private promise?: Promise<T>
    private value?: T
    private initialized = false

    constructor(private readonly factory: () => Promise<T>) {}

    async getValue(): Promise<T> {
        if (this.initialized && this.value !== undefined) {
            return this.value
        }

        this.promise ??= this.factory().then((result) => {
            this.value = result
            this.initialized = true
            return result
        })

        return this.promise
    }

    isInitialized(): boolean {
        return this.initialized
    }
}
