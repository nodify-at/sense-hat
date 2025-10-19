import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { LedMatrix, SenseHat } from '@nodify-at/sense-hat'
import type { AllSensorData, RGB } from '@nodify-at/types'
import { EVENTS } from '@nodify-at/types'
import { LedTextRenderer } from './led.text.renderer.js'

@Injectable()
export class SenseHatService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SenseHatService.name)
    private readonly senseHat: SenseHat = new SenseHat()
    private readonly ledMatrix = new LedMatrix()
    private readonly textRenderer = new LedTextRenderer(this.ledMatrix)

    private intervalId: NodeJS.Timeout | undefined
    private latestData: AllSensorData | undefined

    constructor(@Inject(EventEmitter2) private eventEmitter: EventEmitter2) {}

    onModuleInit(): void {
        try {
            this.ledMatrix.initialize()

            this.logger.log('LED Matrix initialized successfully')
        } catch (error) {
            this.logger.error('Failed to initialize LED Matrix', error)
        }

        try {
            this.logger.log('SenseHat initialized successfully')
            this.startReading()
        } catch (error) {
            this.logger.error('Failed to initialize SenseHat', error)
            this.logger.warn('Running without SenseHat hardware')
        }
    }

    async onModuleDestroy(): Promise<void> {
        this.stopReading()
        if (this.senseHat) {
            await this.senseHat.close()
            this.logger.log('SenseHat destroyed')
        }
        if (this.ledMatrix) {
            this.ledMatrix.close()
            this.logger.log('LED Matrix destroyed')
        }
    }

    private startReading(): void {
        this.intervalId = setInterval(() => {
            if (!this.senseHat) {
                this.logger.warn('SenseHat not initialized')
                return
            }
            this.senseHat
                .getAllSensors()
                .then((data) => {
                    this.latestData = data
                    this.eventEmitter.emit(EVENTS.SENSOR_DATA, data)
                })
                .catch((error) => this.logger.error('Error reading all sensor data', error))
        }, 200)
    }

    private stopReading(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }

    getLatestData(): AllSensorData | undefined {
        return this.latestData
    }

    // LED Matrix Control Methods
    setPixel(x: number, y: number, color: RGB): void {
        this.ledMatrix.setPixel({ x, y }, color)
    }

    setMatrix(matrix: RGB[][]): void {
        this.ledMatrix.setMatrix(matrix)
    }

    clearLed(color?: RGB): void {
        if (color) {
            this.ledMatrix.fill(color)
        } else {
            this.ledMatrix.clear()
        }
    }

    showMessage(
        text: string,
        scrollSpeed = 0.1,
        textColor: RGB = { r: 255, g: 255, b: 255 },
        backColor: RGB = { r: 0, g: 0, b: 0 }
    ): Promise<void> {
        return this.textRenderer.showMessage(text, {
            scrollSpeed,
            textColor,
            backColor,
        })
    }
}
