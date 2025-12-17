import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conductor, ConductorEstado } from './entities/conductor.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { ConductorDataDto, ConductorSelectDto, CreateConductorResponseDto } from './dto/create-conductor-response.dto';

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
                  telefono: createConductorDto.telefono,
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
                    telefono: conductor.telefono,
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
        order: { fecha_vinculacion: 'DESC' },
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


  async getAllConductoresIdAndName(idAdmin: number): Promise<ConductorSelectDto[]> {
    this.logger.log(`Consultando conductores del admin ${idAdmin}`);
    
    try {
      const conductores = await this.conductorRepository.find({
        where: { 
          admin: { id_admin: idAdmin }
        },
        order: { fecha_vinculacion: 'DESC' },
        select:['id_conductor', 'nombre', 'apellido']
      });

      if (conductores.length === 0) {
        this.logger.log(`Admin ${idAdmin} no tiene conductores registrados`);
        return [];
      }

      this.logger.log(`Se encontraron ${conductores.length} conductores para admin ${idAdmin}`);
      return conductores.map(conductor => this.mapToResponseSelectDto(conductor));
      
    } catch (error) {
      this.logger.error(
        `Error al consultar conductores del admin ${idAdmin}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error al obtener la lista de conductores');
    }
  }


  /**
   * Mapea una entidad Conductor a su DTO de respuesta para el select
   * @private
   */
  private mapToResponseSelectDto(conductor: Conductor): ConductorSelectDto {
    return {
      id_conductor: conductor.id_conductor,
      nombre: conductor.nombre,
      apellido: conductor.apellido,
    };
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
      telefono: conductor.telefono,
      fecha_vinculacion: conductor.fecha_vinculacion,
      identificacion: conductor.identificacion,
    };
  }           
  
  


  /**
   * Actualiza un conductor existente
   * @param idConductor - ID del conductor a actualizar
   * @param updateConductorDto - Datos a actualizar
   * @param idAdmin - ID del admin autenticado (ownership)
   * @returns Mensaje de confirmación con datos actualizados
   */
  async updateConductor(
    idConductor: number,
    updateConductorDto: UpdateConductorDto,
    idAdmin: number
  ): Promise<{ message: string; data: ConductorDataDto }> {
    this.logger.log(`Actualizando conductor ${idConductor} del admin ${idAdmin}`);

    // 1. Verificar que el conductor existe y pertenece al admin (multi-tenancy)
    const conductor = await this.conductorRepository.findOne({
      where: {
        id_conductor: idConductor,
        admin: { id_admin: idAdmin }
      }
    });

    if (!conductor) {
      this.logger.warn(`Intento de actualizar conductor inexistente o no autorizado: ${idConductor} por admin ${idAdmin}`);
      throw new NotFoundException('Conductor no encontrado o no tienes permisos');
    }

    // 2. Validar identificación duplicada DENTRO del mismo admin
    if (updateConductorDto.identificacion) {
      const existingIdentificacion = await this.conductorRepository.findOne({
        where: {
          identificacion: updateConductorDto.identificacion,
          id_conductor: Not(idConductor),
          admin: { id_admin: idAdmin } // ← CRÍTICO: validar solo en su admin
        },
      });

      if (existingIdentificacion) {
        this.logger.warn(`Intento de duplicar identificación ${updateConductorDto.identificacion} en admin ${idAdmin}`);
        throw new ConflictException(`La identificación ${updateConductorDto.identificacion} ya está registrada en otro conductor`);
      }
    }

    // 3. Preparar datos para actualización
    const updateData: Partial<Conductor> = {};

    if (updateConductorDto.nombre) updateData.nombre = updateConductorDto.nombre;
    if (updateConductorDto.apellido) updateData.apellido = updateConductorDto.apellido;
    if (updateConductorDto.identificacion) updateData.identificacion = updateConductorDto.identificacion;
    if (updateConductorDto.estado) updateData.estado = updateConductorDto.estado;
    if( updateConductorDto.telefono) updateData.telefono = updateConductorDto.telefono;
    if (updateConductorDto.fecha_vinculacion) {
      updateData.fecha_vinculacion = new Date(updateConductorDto.fecha_vinculacion);
    }

    // 4. Actualizar conductor
    try {
      await this.conductorRepository.update(idConductor, updateData);

      // 5. Obtener conductor actualizado
      const updatedConductor = await this.conductorRepository.findOne({
        where: { id_conductor: idConductor }
      });

      this.logger.log(`Conductor ${idConductor} actualizado exitosamente por admin ${idAdmin}`);

      return {
        message: 'El conductor fue actualizado correctamente',
        data: this.mapToResponseDto(updatedConductor!),
      };
    } catch (error) {
      this.logger.error(
        `Error al actualizar conductor ${idConductor}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Ocurrió un error al actualizar el conductor');
    }
  }
  
  

  /**
   * Obtiene un conductor específico por ID
   * @param idConductor - ID del conductor
   * @param idAdmin - ID del admin autenticado (ownership)
   * @returns Datos del conductor
   */
  async getOneConductor(idConductor: number, idAdmin: number): Promise<ConductorDataDto> {
    this.logger.log(`Consultando conductor ${idConductor} del admin ${idAdmin}`);

    const conductor = await this.conductorRepository.findOne({
      where: { 
        id_conductor: idConductor,
        admin: { id_admin: idAdmin }  
      } 
    });

    if (!conductor) {
      this.logger.warn(`Conductor ${idConductor} no encontrado o no pertenece al admin ${idAdmin}`);
      throw new NotFoundException('No se encontraron los datos de ese conductor');
    }

    this.logger.log(`Conductor ${idConductor} encontrado para admin ${idAdmin}`);
    return this.mapToResponseDto(conductor);
  }
}
