import { Module } from '@nestjs/common';
import { ConductorController } from './conductor.controller';
import { ConductorService } from './conductor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conductor])],
  controllers: [ConductorController],
  providers: [ConductorService]
})
export class ConductorModule {}
