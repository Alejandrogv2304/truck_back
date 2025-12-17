import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Viaje, ViajeEstado } from './entities/viaje.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { CreateViajeResponseDto, ViajeDataDto } from './dto/create-viaje-response.dto';
import { PaginatedViajesResponseDto } from './dto/paginated-viajes-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

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

     /**
      * Crea un nuevo viaje validando todas las relaciones
      * @param createViajeDto - Datos del viaje
      * @param idAdmin - ID del admin autenticado (ownership)
      * @returns Confirmación con datos del viaje creado
      */
     async createViaje(
        createViajeDto: CreateViajeDto,
        idAdmin: number
     ): Promise<CreateViajeResponseDto> {
        this.logger.log(`Creando viaje para admin ${idAdmin}`);

        // 1. Verificar que el admin existe
        const admin = await this.adminRepository.findOne({
          where: { id_admin: idAdmin }
        });
        
        if (!admin) {
          this.logger.warn(`Intento de crear viaje con admin inexistente: ${idAdmin}`);
          throw new NotFoundException('Admin no encontrado');
        }

        // 2. Validar que el camión existe y pertenece al admin
        const camion = await this.camionRepository.findOne({
          where: { 
            id_camion: createViajeDto.idCamion,
            admin: { id_admin: idAdmin }
          }
        });
        
        if (!camion) {
          this.logger.warn(`Camión ${createViajeDto.idCamion} no encontrado o no pertenece al admin ${idAdmin}`);
          throw new NotFoundException('Camión no encontrado o no tienes permisos');
        }

        // 3. Validar que el conductor existe y pertenece al admin
        const conductor = await this.conductorRepository.findOne({
          where: { 
            id_conductor: createViajeDto.idConductor,
            admin: { id_admin: idAdmin }
          }
        });
        
        if (!conductor) {
          this.logger.warn(`Conductor ${createViajeDto.idConductor} no encontrado o no pertenece al admin ${idAdmin}`);
          throw new NotFoundException('Conductor no encontrado o no tienes permisos');
        }

        // 4. Validar numero de manifiesto duplicado para este admin
        const existingManifiesto = await this.viajeRepository.findOne({
          where: { 
            num_manifiesto: createViajeDto.num_manifiesto,
            admin: { id_admin: idAdmin }
          },
        });
        
        if (existingManifiesto) {
          this.logger.warn(`Intento de duplicar número de manifiesto: ${createViajeDto.num_manifiesto} para admin: ${idAdmin}`);
          throw new BadRequestException('Ya existe un viaje con este número de manifiesto');
        }
  
        // 5. Crear el viaje
        try {
          const newViaje = this.viajeRepository.create({
            lugar_origen: createViajeDto.lugar_origen,
            lugar_destino: createViajeDto.lugar_destino, 
            num_manifiesto: createViajeDto.num_manifiesto,
            valor: createViajeDto.valor,
            fecha_inicio: createViajeDto.fecha_inicio 
              ? new Date(createViajeDto.fecha_inicio) 
              : new Date(),
            ...(createViajeDto.estado && { estado: createViajeDto.estado }),
            conductor: conductor, 
            camion: camion,       
            admin: admin,
          });
      
          const viaje = await this.viajeRepository.save(newViaje);
          
          this.logger.log(
            `Viaje creado exitosamente: ID ${viaje.id_viaje}, Camión: ${camion.id_camion}, ` +
            `Conductor: ${conductor.id_conductor}, Admin: ${idAdmin}`
          );
  
          return { 
            message: 'El viaje fue creado correctamente',
            data: {
              id_viaje: viaje.id_viaje,
              lugar_origen: viaje.lugar_origen,
              lugar_destino: viaje.lugar_destino,
              num_manifiesto: viaje.num_manifiesto,
              fecha_inicio: viaje.fecha_inicio,
              valor: viaje.valor,
              estado: viaje.estado,
              idCamion: camion.id_camion,        
              idConductor: conductor.id_conductor, 
            }
          };
        } catch (error) {
          this.logger.error(
            `Error al crear viaje para admin ${idAdmin}: ${error.message}`,
            error.stack
          );
          throw new InternalServerErrorException('Ocurrió un error al registrar el viaje');
        }
     }


     async updateStateViaje(
                   idViaje: number, 
                   idAdmin: number
                 ): Promise<{ message: string; nuevoEstado: ViajeEstado }> {
                     // 1. Buscar viaje con validación de ownership (multi-tenancy)
                     const viaje = await this.viajeRepository.findOne({ 
                       where: { 
                         id_viaje: idViaje,
                         admin: { id_admin: idAdmin }  
                       } 
                     });
                 
                     if (!viaje) {
                       this.logger.warn(`Intento de actualizar viaje inexistente o no autorizado: ${idViaje} por admin ${idAdmin}`);
                       throw new NotFoundException(`Viaje con id ${idViaje} no encontrado o no tienes permisos`);
                     }
                 
                     // 2. Actualizar estado (toggle)
                     try {
                       const estadoAnterior = viaje.estado;
                       viaje.estado =
                         viaje.estado === ViajeEstado.ACTIVO
                           ? ViajeEstado.INACTIVO
                           : ViajeEstado.ACTIVO;
                       
                       await this.viajeRepository.save(viaje);
                       
                       this.logger.log(
                         `Estado de viaje ${idViaje} actualizado: ${estadoAnterior} → ${viaje.estado} (Admin: ${idAdmin})`
                       );
                       
                       return {
                         message: `El estado del viaje fue actualizado correctamente`,
                         nuevoEstado: viaje.estado,
                       };
                     } catch (error) {
                       this.logger.error(
                         `Error al actualizar estado del viaje ${idViaje}: ${error.message}`,
                         error.stack
                       );
                       throw new InternalServerErrorException(
                         'Error al actualizar el estado del viaje',
                       );
                     }
                   }
    
    
    

    /**
     * Obtiene todos los viajes con paginación
     * @param paginationQuery - Parámetros de paginación (page y limit)
     * @param idAdmin - ID del admin autenticado
     * @returns Viajes paginados con metadata
     */
    async getAllViajes(
      paginationQuery: PaginationQueryDto,
      idAdmin: number
    ): Promise<PaginatedViajesResponseDto> {
        const { page = 1, limit = 20 } = paginationQuery;
        
        this.logger.log(
          `Consultando viajes del admin ${idAdmin} - Página: ${page}, Límite: ${limit}`
        );
        
        try {
          // Calcular offset (skip)
          const skip = (page - 1) * limit;
          
          // Contar total de registros (para metadata)
          const [viajes, total] = await this.viajeRepository.findAndCount({
            where: { 
              admin: { id_admin: idAdmin }
            },
            relations: ['camion', 'conductor'],  
            order: { fecha_inicio: 'DESC' },
            take: limit,
            skip: skip
          });
    
          // Calcular metadata de paginación
          const totalPages = Math.ceil(total / limit);
          
          this.logger.log(
            `Se encontraron ${total} viajes en total, mostrando página ${page}/${totalPages}`
          );
          
          return {
            data: viajes.map(viaje => this.mapToResponseDto(viaje)),
            meta: {
              total,
              page,
              limit,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1
            }
          };
          
        } catch (error) {
          this.logger.error(
            `Error al consultar viajes del admin ${idAdmin}: ${error.message}`,
            error.stack
          );
          throw new InternalServerErrorException('Error al obtener la lista de viajes');
        }
      }
    
      /**
       * Mapea una entidad Conductor a su DTO de respuesta
       * @private
       */
      private mapToResponseDto(viaje: Viaje): ViajeDataDto {
        return {
          id_viaje: viaje.id_viaje,
          valor: viaje.valor,
          num_manifiesto: viaje.num_manifiesto,
          lugar_origen: viaje.lugar_origen,
          lugar_destino: viaje.lugar_destino,
          camion: viaje.camion.placa,
          conductor: viaje.conductor.nombre,
          fecha_inicio: viaje.fecha_inicio,
          estado: viaje.estado
        };
      }           
      


      /**
         * Obtiene un viaje específico por ID
         * @param idViaje - ID del viaje
         * @param idAdmin - ID del admin autenticado (ownership)
         * @returns Datos del viaje
         */
        async getOneViaje(idViaje: number, idAdmin: number): Promise<ViajeDataDto> {
          this.logger.log(`Consultando viaje ${idViaje} del admin ${idAdmin}`);
      
          const viaje = await this.viajeRepository.findOne({
            where: { 
              id_viaje: idViaje,
              admin: { id_admin: idAdmin } ,
            
            },
            relations: ['camion', 'conductor'] 
          });
      
          if (!viaje) {
            this.logger.warn(`Viaje ${idViaje} no encontrado o no pertenece al admin ${idAdmin}`);
            throw new NotFoundException('No se encontraron los datos de ese viaje');
          }
      
          this.logger.log(`Viaje ${idViaje} encontrado para admin ${idAdmin}`);
          return this.mapToResponseDto(viaje);
        }
      
}
