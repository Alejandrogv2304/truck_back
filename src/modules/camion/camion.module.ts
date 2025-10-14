import { Module } from '@nestjs/common';
import { CamionController } from './camion.controller';
import { CamionService } from './camion.service';
import { Camion } from './entities/camion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Camion]),AuthModule],
  controllers: [CamionController],
  providers: [CamionService],
  exports:[CamionService],
})
export class CamionModule {}
