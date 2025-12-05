import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Viaje } from './entities/viaje.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';
import { Conductor } from '../conductor/entities/conductor.entity';

@Injectable()
export class ViajeService {
     private readonly logger = new Logger(ViajeService.name);
     constructor(
         @InjectRepository(Viaje)
         private readonly viajeRepository: Repository<Viaje>,
         @InjectRepository(Admin)
         private readonly adminRepository: Repository<Admin>,
         @InjectRepository(Camion)
         private readonly camionRepository: Repository<Camion>,
         @InjectRepository(Conductor)
         private readonly conductorRepository: Repository<Conductor>,
     ){}

     async createViaje(){

     }
}
