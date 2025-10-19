import { io, type Socket } from 'socket.io-client'
import type { ConnectionStatus, Position, RGB, AllSensorData } from '@nodify-at/types'

class SenseHatStore {
    sensorData = $state<(AllSensorData & { timestamp: number }) | undefined>()
    connectionStatus = $state<ConnectionStatus | undefined>()
    isConnected = $state(false)
    error = $state<string | undefined>()

    private socket: Socket | undefined
    private reconnectAttempts = 0
    private readonly maxReconnectAttempts = 5

    connect(url = 'http://192.168.0.187:3000'): void {
        if (this.socket?.connected) {
            console.log('Already connected')
            return
        }

        this.socket = io(url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        })

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket')
            this.isConnected = true
            this.error = undefined
            this.reconnectAttempts = 0
        })

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket')
            this.isConnected = false
        })

        this.socket.on('status', (data: ConnectionStatus) => {
            console.log('Status:', data)
            this.connectionStatus = data
        })

        this.socket.on('sensorData', (data: AllSensorData & { timestamp: number }) => {
            this.sensorData = data
            this.error = undefined
        })

        this.socket.on('error', (err: { message: string }) => {
            console.error('WebSocket error:', err)
            this.error = err.message
        })

        this.socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message)
            this.reconnectAttempts++
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.error = `Failed to connect after ${this.maxReconnectAttempts} attempts`
            } else {
                this.error = `Connection error: ${err.message} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            }
        })
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners()
            this.socket.disconnect()
            this.socket = undefined
        }
        this.isConnected = false
        this.sensorData = undefined
        this.connectionStatus = undefined
    }

    // LED Control Methods
    setPixel(position: Position, color: RGB): void {
        if (this.socket?.connected) {
            this.socket.emit('led:setPixel', { ...position, ...color })
        }
    }

    clearLed(r?: number, g?: number, b?: number): void {
        if (this.socket?.connected) {
            if (r !== undefined && g !== undefined && b !== undefined) {
                this.socket.emit('led:clear', { r, g, b })
            } else {
                this.socket.emit('led:clear', {})
            }
        }
    }

    setMatrix(matrix: RGB[][]): void {
        if (this.socket?.connected) {
            this.socket.emit('led:setMatrix', { matrix })
        }
    }

    showMessage(
        text: string,
        scrollSpeed?: number,
        textColor?: { r: number; g: number; b: number },
        backColor?: { r: number; g: number; b: number }
    ): void {
        if (this.socket?.connected) {
            this.socket.emit('led:showMessage', { text, scrollSpeed, textColor, backColor })
        }
    }
}

export const senseHatStore = new SenseHatStore()
