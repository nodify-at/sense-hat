import { SenseHat } from '@nodify-at/sense-hat'

const senseHat = new SenseHat()

try {
    // Read individual sensors
    console.log('Temperature:', (await senseHat.getTemperature()).toFixed(2), '°C')
    console.log('Humidity:', (await senseHat.getHumidity()).toFixed(2), '%')
    console.log('Pressure:', (await senseHat.getPressure()).toFixed(2), 'hPa')

    // Read motion sensors
    const accel = await senseHat.getAccelerometer()
    console.log(
        'Accelerometer:',
        `X: ${accel.x.toFixed(3)}g, Y: ${accel.y.toFixed(3)}g, Z: ${accel.z.toFixed(3)}g`
    )

    const gyro = await senseHat.getGyroscope()
    console.log(
        'Gyroscope:',
        `X: ${gyro.x.toFixed(2)}°/s, Y: ${gyro.y.toFixed(2)}°/s, Z: ${gyro.z.toFixed(2)}°/s`
    )

    const mag = await senseHat.getMagnetometer()
    console.log(
        'Magnetometer:',
        `X: ${mag.x.toFixed(3)}G, Y: ${mag.y.toFixed(3)}G, Z: ${mag.z.toFixed(3)}G`
    )

    // Get orientation
    const orientation = await senseHat.getOrientation()
    console.log(
        'Orientation:',
        `Pitch: ${orientation.pitch.toFixed(1)}°, Roll: ${orientation.roll.toFixed(1)}°, Yaw: ${orientation.yaw.toFixed(1)}°`
    )

    // Or get all at once (more efficient)
    console.log('\nAll sensors:')
    const allData = await senseHat.getAllSensors()
    console.log(JSON.stringify(allData, null, 2))
} finally {
    await senseHat.close()
}
