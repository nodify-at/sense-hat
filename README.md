# Sense HAT 2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

A modern TypeScript-based Raspberry Pi Sense HAT controller providing real-time sensor data streaming and LED matrix control via WebSocket. Built with a monorepo architecture for maximum modularity and reusability.

## ✨ Features

- 🎯 **Full Sense HAT Support**: Complete access to all sensors and LED matrix
- 🌡️ **Environmental Sensing**: Temperature, humidity, and barometric pressure
- 🎢 **Motion Tracking**: 9-axis IMU (accelerometer, gyroscope, magnetometer)
- 💡 **LED Matrix Control**: 8x8 RGB LED with pixel precision and text scrolling
- 🔌 **WebSocket API**: Real-time data streaming and remote control
- 📦 **Monorepo Structure**: Clean separation of core library, server, and demo app
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ⚡ **High Performance**: Optimized I2C communication and sensor polling

## 📋 Requirements

- **Node.js**: v24 or higher (see `.nvmrc`)
- **Hardware**: Raspberry Pi with Sense HAT (tested on Raspberry Pi 5)
- **OS**: Raspberry Pi OS (64-bit recommended)
- **Interfaces**: I2C enabled (via `raspi-config`)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sense-hat2.git
cd sense-hat2

# Install dependencies
npm install

# Build all packages
npm run build
```

### Running the Demo

**On Raspberry Pi:**
```bash
cd packages/demo-server
npm run dev
# Server starts on http://0.0.0.0:3000
```

**On any device with network access:**
```bash
cd packages/demo
npm run dev
# Update the IP in src/lib/stores/sensehat.svelte.ts to match your Pi
```

## Packages

### `@nodify-at/sense-hat`

Core library for interfacing with the Raspberry Pi Sense HAT hardware.

#### Features

- **LED Matrix Control**: Full 8x8 RGB LED matrix control with pixel-level precision, pattern rendering, and scrolling text support
- **Environmental Sensors**:
  - Temperature and humidity (HTS221)
  - Barometric pressure (LPS25H)
- **Motion Sensors**:
  - 3-axis accelerometer (LSM9DS1)
  - 3-axis gyroscope (LSM9DS1)
  - 3-axis magnetometer (LSM9DS1)
- **I2C Device Discovery**: Automatic detection and enumeration of connected devices
- **Type-Safe API**: Full TypeScript support with comprehensive type definitions

#### Architecture

The library is organized into modular components:

- **`core/`**: Base sensor implementation and I2C device communication layer
- **`sensors/`**: Individual sensor implementations (environment and motion)
- **`led/`**: LED matrix controller with RGB565 color support
- **`utils/`**: Color conversion, I2C discovery, and helper utilities
- **`types/`**: TypeScript type definitions for all sensor data and configurations

#### Example Usage

```typescript
import { SenseHat, LedMatrix } from '@nodify-at/sense-hat';

// Read sensor data
const senseHat = new SenseHat();
const data = await senseHat.getAllSensors();
console.log(data); // { temperature, humidity, pressure, accelerometer, gyroscope, magnetometer }

// Control LED matrix
const led = new LedMatrix();
led.initialize();
led.setPixel({ x: 0, y: 0 }, { r: 255, g: 0, b: 0 }); // Red pixel
led.clear();
```

---

### `@nodify-at/demo-server`

NestJS-based WebSocket server that streams real-time sensor data and provides LED control APIs.

#### Requirements

- **Must run on Raspberry Pi** with Sense HAT connected
- **Tested on**: Raspberry Pi 5
- **Setup Required**: Enable i2c and other necessary interfaces via `raspi-config`:
  ```bash
  sudo raspi-config
  # Navigate to: Interface Options → I2C → Enable
  # Also enable: SPI, Serial (if needed)
  ```

#### Features

- Real-time sensor data broadcasting (200ms intervals)
- WebSocket API for LED matrix control
- Built with NestJS and Fastify
- CORS enabled for remote connections

#### Usage

```bash
cd packages/demo-server

# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server runs on `http://0.0.0.0:3000` with WebSocket on `ws://0.0.0.0:3000`

#### WebSocket Events

**Incoming (Client → Server)**:
- `getSensorData` - Request latest sensor readings
- `led:setPixel` - Set individual LED pixel color
- `led:clear` - Clear LED matrix
- `led:setMatrix` - Set entire 8x8 matrix
- `led:showMessage` - Display scrolling text

**Outgoing (Server → Client)**:
- `sensorData` - Real-time sensor data broadcast
- `status` - Connection status
- `led:success` - LED operation confirmation
- `error` - Error messages

---

### `demo`

Svelte 5-based web application for visualizing Sense HAT data and controlling the LED matrix.

#### Features

- Real-time sensor data visualization
- Interactive LED matrix control
- 3D motion vector display
- WebSocket connection management

#### Usage

```bash
cd packages/demo

# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

#### Configuration

Update the WebSocket server URL in `src/lib/stores/sensehat.svelte.ts`:

```typescript
connect(url = 'http://YOUR_RASPBERRY_PI_IP:3000'): void {
  // Default: 'http://192.168.0.187:3000'
}
```

The demo app can run anywhere (laptop, phone, etc.) - it only needs network access to the Raspberry Pi server.

---

## 🏗️ Project Structure

```
sense-hat2/
├── packages/
│   ├── sense-hat/          # Core library for Sense HAT hardware
│   ├── types/              # Shared TypeScript type definitions
│   ├── demo-server/        # NestJS WebSocket server
│   ├── demo/               # Svelte web application
│   └── examples/           # Usage examples
├── package.json            # Workspace configuration
└── tsconfig.json          # Shared TypeScript config
```

## 🛠️ Development

### Prerequisites Setup (Raspberry Pi)

Enable I2C and other interfaces:

```bash
sudo raspi-config
# Navigate to: Interface Options
# Enable: I2C, SPI (if using other HATs)
# Reboot when prompted
```

Verify I2C is working:

```bash
sudo i2cdetect -y 1
# Should show devices at addresses 0x1c, 0x5c, 0x5f, 0x6a
```

### Available Scripts

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Lint all packages
npm run lint

# Format all packages
npm run format

# Run specific package
npm run dev --workspace=packages/demo-server
npm run dev --workspace=packages/demo
```

### Testing Changes

1. Make changes to the core library (`packages/sense-hat`)
2. Build: `npm run build --workspace=packages/sense-hat`
3. Test with demo-server: `cd packages/demo-server && npm run dev`

## 📚 API Documentation

### Core Library Examples

```typescript
import { SenseHat, LedMatrix, Colors } from '@nodify-at/sense-hat';

// Initialize and read all sensors
const senseHat = new SenseHat();
const data = await senseHat.getAllSensors();
console.log(`Temperature: ${data.temperature}°C`);
console.log(`Humidity: ${data.humidity}%`);
console.log(`Pressure: ${data.pressure} hPa`);

// Individual sensor access
const temp = await senseHat.getTemperature();
const motion = await senseHat.getMotionData();

// LED Matrix control
const led = new LedMatrix();
led.initialize();

// Set individual pixels
led.setPixel({ x: 3, y: 3 }, Colors.RED);

// Fill with color
led.fill(Colors.BLUE);

// Display text
led.showMessage('Hello!', { scrollSpeed: 0.1 });

// Cleanup
await senseHat.close();
led.close();
```

### WebSocket Client Example

```typescript
import { io } from 'socket.io-client';

const socket = io('http://raspberrypi.local:3000');

socket.on('sensorData', (data) => {
  console.log('Temperature:', data.temperature);
  console.log('Accelerometer:', data.accelerometer);
});

// Control LED
socket.emit('led:setPixel', { x: 0, y: 0, r: 255, g: 0, b: 0 });
socket.emit('led:showMessage', { text: 'Hi!', scrollSpeed: 0.1 });
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

### Code Style

- Run `npm run format` before committing
- Ensure `npm run lint` passes
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### I2C Errors

```bash
# Check I2C is enabled
ls /dev/i2c-*

# Verify devices are detected
sudo i2cdetect -y 1

# If issues persist, try:
sudo apt-get update
sudo apt-get install i2c-tools
```

### Permission Errors

```bash
# Add user to i2c group
sudo usermod -a -G i2c $USER
# Logout and login again
```

### Node Version Issues

```bash
# Use nvm to install correct version
nvm install 24
nvm use 24
```

## 🙏 Acknowledgments

- [Raspberry Pi Foundation](https://www.raspberrypi.org/) for the Sense HAT hardware
- [i2c-bus](https://github.com/fivdi/i2c-bus) for Node.js I2C communication
- [NestJS](https://nestjs.com/) for the WebSocket server framework
- [Svelte](https://svelte.dev/) for the demo application framework

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for the Raspberry Pi community**
