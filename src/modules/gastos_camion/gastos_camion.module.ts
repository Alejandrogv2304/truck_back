import { Module } from '@nestjs/common';
import { GastosCamionService } from './gastos_camion.service';
import { GastosCamionController } from './gastos_camion.controller';

@Module({
  providers: [GastosCamionService],
  controllers: [GastosCamionController]
})
export class GastosCamionModule {}
