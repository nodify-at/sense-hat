/**
 * WebSocket event names
 */
export const EVENTS = {
    SENSOR_DATA: 'sensor.data',
} as const

export type EventType = (typeof EVENTS)[keyof typeof EVENTS]
