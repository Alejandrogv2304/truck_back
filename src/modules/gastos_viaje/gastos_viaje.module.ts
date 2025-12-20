import { Module } from '@nestjs/common';
import { GastosViajeController } from './gastos_viaje.controller';
import { GastosViajeService } from './gastos_viaje.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosViaje } from './entities/gastos_viaje.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Viaje } from '../viaje/entities/viaje.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Viaje, Admin, GastosViaje])],
  controllers: [GastosViajeController],
  providers: [GastosViajeService],
   exports: [GastosViajeService],
})
export class GastosViajeModule {}
