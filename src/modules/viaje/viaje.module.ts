import { Module } from '@nestjs/common';
import { ViajeService } from './viaje.service';
import { ViajeController } from './viaje.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Viaje } from './entities/viaje.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';
import { Conductor } from '../conductor/entities/conductor.entity';


@Module({
  imports:[TypeOrmModule.forFeature([Viaje, Admin, Camion, Conductor])],
  providers: [ViajeService],
  controllers: [ViajeController],
  exports: [ViajeService],
})
export class ViajeModule {}
