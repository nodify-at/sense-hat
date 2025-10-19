export type {
    Vector3D,
    Orientation,
    EnvironmentData,
    MotionData,
    AllSensorData,
    SensorReading,
    EnvironmentalReading,
    IMUReading,
} from './sensor/data.types.js'

export type { Sensor, SensorOptions } from './sensor/sensor.types.js'

export type { I2CDevice, I2CConfig, IIOChannel } from './sensor/hardware.types.js'

export type { RGB, Position, Pixel, LEDMatrixConfig } from './led/led.types.js'
export { Rotation } from './led/led.types.js'

export { LED_MATRIX, Colors } from './led/led.constants.js'

export { EVENTS } from './events/events.constants.js'
export type { EventType } from './events/events.constants.js'

export type { ConnectionStatus, SensorData } from './communication/websocket.types.js'
