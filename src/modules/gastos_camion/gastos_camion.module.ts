import { Module } from '@nestjs/common';
import { GastosCamionService } from './gastos_camion.service';
import { GastosCamionController } from './gastos_camion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosCamion } from './entities/gastos_camion.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GastosCamion, Admin, Camion])],
  providers: [GastosCamionService],
  controllers: [GastosCamionController],
  exports: [GastosCamionService],
})
export class GastosCamionModule {}
