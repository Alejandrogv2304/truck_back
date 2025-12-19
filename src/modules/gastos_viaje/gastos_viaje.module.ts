import { Module } from '@nestjs/common';
import { GastosViajeController } from './gastos_viaje.controller';
import { GastosViajeService } from './gastos_viaje.service';

@Module({
  controllers: [GastosViajeController],
  providers: [GastosViajeService]
})
export class GastosViajeModule {}
