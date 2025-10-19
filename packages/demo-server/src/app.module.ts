import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { EventsGateway } from './events.gateway.js'
import { SenseHatService } from './sense-hat.service.js'

@Module({
    imports: [EventEmitterModule.forRoot()],
    controllers: [],
    providers: [SenseHatService, EventsGateway],
})
export class AppModule {}
