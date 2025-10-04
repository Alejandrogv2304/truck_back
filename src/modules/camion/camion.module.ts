import { Module } from '@nestjs/common';
import { CamionController } from './camion.controller';
import { CamionService } from './camion.service';
import { Camion } from './entities/camion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Camion])],
  controllers: [CamionController],
  providers: [CamionService],
  exports:[CamionService],
})
export class CamionModule {}
