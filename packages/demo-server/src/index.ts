import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { FastifyAdapter } from '@nestjs/platform-fastify'

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
        logger: ['log', 'error', 'warn', 'debug'],
    })

    await app.listen(3000, '0.0.0.0')
    console.log('Server is running on http://localhost:3000')
    console.log('WebSocket available at ws://localhost:3000')
}

void bootstrap()
