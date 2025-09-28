import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports:[TypeOrmModule.forFeature([Admin]),
 AdminModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
