import { Module } from '@nestjs/common';
import { ViajeService } from './viaje.service';
import { ViajeController } from './viaje.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Viaje } from './entities/viaje.entity';
import { Admin } from 'typeorm';
import { Conductor } from '../conductor/entities/conductor.entity';
import { Camion } from '../camion/entities/camion.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Viaje,Admin,Conductor,Camion])],
  providers: [ViajeService],
  controllers: [ViajeController],
  exports: [ViajeService],
})
export class ViajeModule {}
