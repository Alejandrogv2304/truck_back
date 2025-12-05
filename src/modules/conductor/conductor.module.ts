import { Module } from '@nestjs/common';
import { ConductorController } from './conductor.controller';
import { ConductorService } from './conductor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { Admin } from '../admin/entities/admin.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Conductor, Admin]) ],
  controllers: [ConductorController],
  providers: [ConductorService],
  exports: [ConductorService],
})
export class ConductorModule {}
