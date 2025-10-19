import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SenseHatService } from './sense-hat.service.js'
import type { AllSensorData } from '@nodify-at/types'
import { EVENTS } from '@nodify-at/types'

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server | undefined

    private logger: Logger = new Logger('EventsGateway')

    constructor(@Inject(SenseHatService) private readonly senseHatService: SenseHatService) {
        this.logger.log('EventsGateway constructor - SenseHatService:', !!this.senseHatService)
    }

    afterInit(): void {
        this.logger.log('WebSocket Gateway initialized')
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`)

        // Send current status
        const status = {
            message: 'Welcome to the SenseHat WebSocket server!',
        }
        client.emit('status', status)

        // Send the latest data immediately if available
        const latestData = this.senseHatService.getLatestData()
        if (latestData) {
            client.emit('sensorData', latestData)
        }
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`)
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
        this.logger.log(`Received message: ${data}`)
        client.emit('message', `Echo: ${data}`)
    }

    @SubscribeMessage('getSensorData')
    handleGetSensorData(@ConnectedSocket() client: Socket): void {
        const data = this.senseHatService.getLatestData()
        if (data) {
            client.emit('sensorData', data)
        } else {
            client.emit('error', { message: 'No sensor data available' })
        }
    }

    @SubscribeMessage('led:setPixel')
    handleSetPixel(
        @MessageBody() data: { x: number; y: number; r: number; g: number; b: number },
        @ConnectedSocket() client: Socket
    ): void {
        try {
            this.senseHatService.setPixel(data.x, data.y, { r: data.r, g: data.g, b: data.b })
            client.emit('led:success', { action: 'setPixel' })
        } catch (error) {
            this.logger.error('Error setting pixel', error)
            client.emit('error', { message: 'Failed to set pixel' })
        }
    }

    @SubscribeMessage('led:clear')
    handleClear(
        @MessageBody() data: { r?: number; g?: number; b?: number },
        @ConnectedSocket() client: Socket
    ): void {
        try {
            if (data.r !== undefined && data.g !== undefined && data.b !== undefined) {
                this.senseHatService.clearLed({ r: data.r, g: data.g, b: data.b })
            } else {
                this.senseHatService.clearLed()
            }
            client.emit('led:success', { action: 'clear' })
        } catch (error) {
            this.logger.error('Error clearing LED', error)
            client.emit('error', { message: 'Failed to clear LED' })
        }
    }

    @SubscribeMessage('led:setMatrix')
    handleSetMatrix(
        @MessageBody() data: { matrix: { r: number; g: number; b: number }[][] },
        @ConnectedSocket() client: Socket
    ): void {
        try {
            this.senseHatService.setMatrix(data.matrix)
            client.emit('led:success', { action: 'setMatrix' })
        } catch (error) {
            this.logger.error('Error setting matrix', error)
            client.emit('error', { message: 'Failed to set matrix' })
        }
    }

    @SubscribeMessage('led:showMessage')
    handleShowMessage(
        @MessageBody()
        data: {
            text: string
            scrollSpeed?: number
            textColor?: { r: number; g: number; b: number }
            backColor?: { r: number; g: number; b: number }
        },
        @ConnectedSocket() client: Socket
    ): void {
        try {
            this.senseHatService
                .showMessage(data.text, data.scrollSpeed, data.textColor, data.backColor)
                .then(() => client.emit('led:success', { action: 'showMessage' }))
                .catch((error) => {
                    this.logger.error('Error showing message', error)
                    client.emit('error', { message: 'Failed to show message' })
                })
        } catch (error) {
            this.logger.error('Error showing message', error)
            client.emit('error', { message: 'Failed to show message' })
        }
    }

    @OnEvent(EVENTS.SENSOR_DATA)
    handleSensorData(data: AllSensorData): void {
        if (this.server) {
            this.server.emit('sensorData', {
                ...data,
                timestamp: Date.now(),
            })
        }
    }
}
