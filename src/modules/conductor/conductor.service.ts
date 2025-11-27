import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { CreateConductorResponseDto } from './dto/create-conductor-response.dto';

@Injectable()
export class ConductorService {
    private readonly logger = new Logger(ConductorService.name);

    constructor(
         @InjectRepository(Conductor)
            private readonly conductorRepository: Repository<Conductor>,
         @InjectRepository(Admin)
            private readonly adminRepository: Repository<Admin>,
    ){}

     async createConductor(
        createConductorDto: CreateConductorDto, 
        idAdmin: number
     ): Promise<CreateConductorResponseDto> {
              // 1. Verificar que el admin existe
              const admin = await this.adminRepository.findOne({
                where: { id_admin: idAdmin }
              });
              
              if (!admin) {
                this.logger.warn(`Intento de crear conductor con admin inexistente: ${idAdmin}`);
                throw new NotFoundException('Admin no encontrado');
              }

              // 2. Validar identificacion duplicada para este admin
              const existingIdentificacion = await this.conductorRepository.findOne({
                where: { 
                  identificacion: createConductorDto.identificacion,
                  admin: { id_admin: idAdmin }
                },
              });
              
              if (existingIdentificacion) {
                this.logger.warn(`Intento de duplicar identificación: ${createConductorDto.identificacion}`);
                throw new BadRequestException('Ya existe un conductor con esta identificación');
              }
        
             
              try {
                const newConductor = this.conductorRepository.create({
                  nombre: createConductorDto.nombre,
                  apellido: createConductorDto.apellido,
                  identificacion: createConductorDto.identificacion,
                  fecha_vinculacion: createConductorDto.fecha_vinculacion 
                    ? new Date(createConductorDto.fecha_vinculacion) 
                    : new Date(),
                  ...(createConductorDto.estado && { estado: createConductorDto.estado }),
                  admin: admin,
                });
            
                const conductor = await this.conductorRepository.save(newConductor);
                
                this.logger.log(`Conductor creado exitosamente: ID ${conductor.id_conductor}, Admin: ${idAdmin}`);
        
                return { 
                  message: 'El conductor fue creado correctamente',
                  data: {
                    id_conductor: conductor.id_conductor,
                    nombre: conductor.nombre,
                    apellido: conductor.apellido,
                    identificacion: conductor.identificacion,
                    fecha_vinculacion: conductor.fecha_vinculacion,
                    estado: conductor.estado,
                  }
                };
              } catch (error) {
                this.logger.error(
                  `Error al crear conductor para admin ${idAdmin}: ${error.message}`,
                  error.stack
                );
                throw new InternalServerErrorException('Ocurrió un error al registrar el conductor');
              }
            }
    
}
