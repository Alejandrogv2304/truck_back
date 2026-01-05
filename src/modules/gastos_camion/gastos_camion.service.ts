import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GastosCamion } from './entities/gastos_camion.entity';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';
import { CreateGastoCamionDto } from './dto/create-gasto-camion.dto';
import { CreateGastoCamionResponseDto, GastoCamionResponseDto } from './dto/create-gasto-camin-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedGastosCamionResponseDto } from './dto/paginated-gastos-camion-response.dto';

@Injectable()
export class GastosCamionService {

    private readonly logger = new Logger(GastosCamionService.name);
    constructor(
         @InjectRepository(GastosCamion)
         private readonly gastosCamionRepository: Repository<GastosCamion>,
         @InjectRepository(Admin)
         private readonly adminRepository: Repository<Admin>,
         @InjectRepository(Camion)
         private readonly camionRepository: Repository<Camion>,
    ){}


    async createGastoCamion(idAdmin: number, createGastoCamionDto:CreateGastoCamionDto)
    :Promise<CreateGastoCamionResponseDto>{

      this.logger.log(`Creando el gasto de camion para admin ${idAdmin}`);

      // 1. Verificar que el admin existe
      const admin = await this.adminRepository.findOne({
        where: { id_admin: idAdmin }
      });

      if (!admin) {
        this.logger.warn(`Intento de crear gasto de camion con admin inexistente: ${idAdmin}`);
        throw new NotFoundException('Admin no encontrado');
      }

      // 2. Validar que el camion existe y pertenece al admin
      const camion = await this.camionRepository.findOne({
        where: { 
          id_camion: createGastoCamionDto.id_camion,
          id_admin: idAdmin
        }
      });

      if (!camion) {
        this.logger.warn(`Camion no encontrado o no pertenece al admin ${idAdmin}`);
        throw new NotFoundException('Camion no encontrado o no tienes permisos');
      }

      // 3. Validar que el camion esté activo
      if (camion.estado !== 'activo') {
        this.logger.warn(`Intento de crear gasto de camion para un camion inactivo: Camion ${createGastoCamionDto.id_camion}, Admin ${idAdmin}`);
        throw new InternalServerErrorException('No se pueden agregar gastos a un camion inactivo');
      }

      // 4. Crear el gasto
      try {
        const newGastoCamion = this.gastosCamionRepository.create({
          tipo_gasto: createGastoCamionDto.tipo_gasto,
          id_camion: createGastoCamionDto.id_camion,
          valor: createGastoCamionDto.valor,
          id_admin: idAdmin,
          descripcion: createGastoCamionDto.descripcion,
          fecha: createGastoCamionDto.fecha,
        });

        const gastoCamion = await this.gastosCamionRepository.save(newGastoCamion);

        this.logger.log(
          `Gasto de camion creado exitosamente: ID ${gastoCamion.id_gasto_camion}, Admin: ${gastoCamion.id_admin}`
        );

        return {
          message: 'El gasto de camion fue creado correctamente',
          data: {
            id_gasto_camion: gastoCamion.id_gasto_camion,
            valor: gastoCamion.valor,
            fecha: gastoCamion.fecha,
            tipo_gasto: gastoCamion.tipo_gasto,
            descripcion: gastoCamion.descripcion,
            id_camion: gastoCamion.id_camion,
            id_admin: gastoCamion.id_admin
          }
        };
      } catch (error) {
        this.logger.error(
          `Error al crear gasto de camion para admin ${idAdmin}: ${error.message}`,
          error.stack
        );
        throw new InternalServerErrorException('Ocurrió un error al registrar el gasto del camión');
      }
    }

    async deleteGastoCamion(
          idAdmin: number,
          idGastoCamion: number
         ) {
          this.logger.log(`Eliminando el gasto de camion ${idGastoCamion} para admin ${idAdmin}`);

          try {
            // 1. Validar que el gasto existe y pertenece al admin
            const gastoCamion = await this.gastosCamionRepository.findOne({
              where: { 
                id_gasto_camion: idGastoCamion,
                id_admin: idAdmin
              }
            });

            if (!gastoCamion) {
              this.logger.warn(`Gasto de camion ${idGastoCamion} no encontrado o no pertenece al admin ${idAdmin}`);
              throw new NotFoundException('Gasto de camion no encontrado o no tienes permisos');
            }

            // 2. Eliminar permanentemente el gasto
            const result = await this.gastosCamionRepository.delete(idGastoCamion);

            if (result.affected === 0) {
              throw new InternalServerErrorException('No se pudo eliminar el gasto de camion');
            }

            this.logger.log(
              `Gasto de camion eliminado exitosamente: ID ${idGastoCamion}, Admin: ${idAdmin}`
            );

            return {
              message: 'El gasto de camion fue eliminado correctamente',
              data: {
                id_gasto_camion: idGastoCamion,
                affected: result.affected
              }
            };
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw error;
            }
            this.logger.error(
              `Error al eliminar gasto de camion ${idGastoCamion} para admin ${idAdmin}: ${error.message}`,
              error.stack
            );
            throw new InternalServerErrorException('Ocurrió un error al eliminar el gasto de camion');
          }
         }

 /**
   * Obtiene todos los gastos de camión con paginación y filtro opcional por placa
   * @param paginationQuery - Parámetros de paginación (page, limit y placa opcional)
   * @param idAdmin - ID del admin autenticado
   * @returns Gastos de camión paginados con metadata
   */
  async findAllGastosCamion(
    paginationQuery: PaginationQueryDto,
    idAdmin: number
  ): Promise<PaginatedGastosCamionResponseDto> {
    const { page = 1, limit = 15, placa } = paginationQuery;
    
    this.logger.log(
      `Consultando gastos de camión del admin ${idAdmin} - Página: ${page}, Límite: ${limit}${placa ? `, Placa: ${placa}` : ''}`
    );
    
    try {
      // Calcular offset (skip)
      const skip = (page - 1) * limit;
      
      // Construir query con filtros
      const queryBuilder = this.gastosCamionRepository
        .createQueryBuilder('gasto_camion')
        .leftJoinAndSelect('gasto_camion.camion', 'camion')
        .where('gasto_camion.id_admin = :idAdmin', { idAdmin });

      // Aplicar filtro por placa si se proporciona
      if (placa) {
        queryBuilder.andWhere('camion.placa ILIKE :placa', { 
          placa: `%${placa}%` 
        });
      }

      // Ordenar por fecha descendente (más recientes primero)
      queryBuilder.orderBy('gasto_camion.fecha', 'DESC');

      // Contar total de registros (para metadata)
      const total = await queryBuilder.getCount();
      
      // Aplicar paginación
      const gastosCamion = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      // Calcular metadata de paginación
      const totalPages = Math.ceil(total / limit);
      
      this.logger.log(
        `Se encontraron ${total} gastos de camión en total, mostrando página ${page}/${totalPages}`
      );
      
      return {
        data: gastosCamion.map(gasto => this.mapToResponseDto(gasto)),
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
        `Error al consultar gastos de camión del admin ${idAdmin}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error al obtener la lista de gastos de camión');
    }
  }

  /**
   * Mapea una entidad GastosCamion a su DTO de respuesta
   * @private
   */
  private mapToResponseDto(gasto: GastosCamion): GastoCamionResponseDto {
    return {
      id_gasto_camion: gasto.id_gasto_camion,
      valor: gasto.valor,
      tipo_gasto: gasto.tipo_gasto,
      descripcion: gasto.descripcion,
      fecha: gasto.fecha,
      id_camion: gasto.id_camion,
      id_admin: gasto.id_admin
    };
  }

}
