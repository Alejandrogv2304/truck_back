import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CamionModule } from './modules/camion/camion.module';
import { ConductorModule } from './modules/conductor/conductor.module';
import { ViajeModule } from './modules/viaje/viaje.module';
import { GatosViajeModule } from './modules/gatos_viaje/gatos_viaje.module';
import { GastosViajeController } from './modules/gastos_viaje/gastos_viaje.controller';
import { GastosViajeModule } from './modules/gastos_viaje/gastos_viaje.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true, // disponible en toda la app
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, 
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AdminModule,
    AuthModule,
    CamionModule,
    ConductorModule,
    ViajeModule,
    GatosViajeModule,
    GastosViajeModule,
   
  ],
  controllers: [AppController, GastosViajeController],
  providers: [AppService],
})
export class AppModule {}
