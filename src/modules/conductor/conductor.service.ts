import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conductor, ConductorEstado } from './entities/conductor.entity';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { ConductorDataDto, CreateConductorResponseDto } from './dto/create-conductor-response.dto';

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
    

            async updateStateConductor(
              idConductor: number, 
              idAdmin: number
            ): Promise<{ message: string; nuevoEstado: ConductorEstado }> {
                // 1. Buscar conductor con validación de ownership (multi-tenancy)
                const conductor = await this.conductorRepository.findOne({ 
                  where: { 
                    id_conductor: idConductor,
                    admin: { id_admin: idAdmin }  
                  } 
                });
            
                if (!conductor) {
                  this.logger.warn(`Intento de actualizar conductor inexistente o no autorizado: ${idConductor} por admin ${idAdmin}`);
                  throw new NotFoundException(`Conductor con id ${idConductor} no encontrado o no tienes permisos`);
                }
            
                // 2. Actualizar estado (toggle)
                try {
                  const estadoAnterior = conductor.estado;
                  conductor.estado =
                    conductor.estado === ConductorEstado.ACTIVO
                      ? ConductorEstado.INACTIVO
                      : ConductorEstado.ACTIVO;
                  
                  await this.conductorRepository.save(conductor);
                  
                  this.logger.log(
                    `Estado de conductor ${idConductor} actualizado: ${estadoAnterior} → ${conductor.estado} (Admin: ${idAdmin})`
                  );
                  
                  return {
                    message: `El estado del conductor fue actualizado correctamente`,
                    nuevoEstado: conductor.estado,
                  };
                } catch (error) {
                  this.logger.error(
                    `Error al actualizar estado del conductor ${idConductor}: ${error.message}`,
                    error.stack
                  );
                  throw new InternalServerErrorException(
                    'Error al actualizar el estado del conductor',
                  );
                }
              }


  /**
   * Obtiene todos los conductores asociados a un admin específico
   * @param idAdmin - ID del admin autenticado
   * @returns Array de conductores (puede ser vacío si no tiene ninguno)
   */
  async getAllConductores(idAdmin: number): Promise<ConductorDataDto[]> {
    this.logger.log(`Consultando conductores del admin ${idAdmin}`);
    
    try {
      const conductores = await this.conductorRepository.find({
        where: { 
          admin: { id_admin: idAdmin }
        },
        order: { fecha_vinculacion: 'DESC' }
      });

      if (conductores.length === 0) {
        this.logger.log(`Admin ${idAdmin} no tiene conductores registrados`);
        return [];
      }

      this.logger.log(`Se encontraron ${conductores.length} conductores para admin ${idAdmin}`);
      return conductores.map(conductor => this.mapToResponseDto(conductor));
      
    } catch (error) {
      this.logger.error(
        `Error al consultar conductores del admin ${idAdmin}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error al obtener la lista de conductores');
    }
  }

  /**
   * Mapea una entidad Conductor a su DTO de respuesta
   * @private
   */
  private mapToResponseDto(conductor: Conductor): ConductorDataDto {
    return {
      id_conductor: conductor.id_conductor,
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      estado: conductor.estado,
      fecha_vinculacion: conductor.fecha_vinculacion,
      identificacion: conductor.identificacion,
    };
  }             
}
