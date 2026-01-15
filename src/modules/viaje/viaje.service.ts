import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Viaje, ViajeEstado } from './entities/viaje.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Camion } from '../camion/entities/camion.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { GastosCamion } from '../gastos_camion/entities/gastos_camion.entity';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { CreateViajeResponseDto, ViajeDataDto } from './dto/create-viaje-response.dto';
import { PaginatedViajesResponseDto } from './dto/paginated-viajes-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';
import { EstadisticasViajesDto } from './dto/estadisticas-dto';
import { EstadisticasGraficasResponseDto, EstadisticasMesDto, InformeMensualDto, DetalleViajeInformeDto, DettallesGastosCamionDto } from './dto/estadisticas-graficas.dto';


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
         @InjectRepository(GastosCamion)
         private readonly gastosCamionRepository: Repository<GastosCamion>,
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



        async updateViaje(
  idViaje: number,
  updateViajeDto: UpdateViajeDto,
  idAdmin: number
): Promise<{ message: string; data: Viaje }> {
  // 1. Buscar viaje con ownership
  const viaje = await this.viajeRepository.findOne({
    where: { 
      id_viaje: idViaje,
      admin: { id_admin: idAdmin }
    }
  });

  if (!viaje) {
    throw new NotFoundException('Viaje no encontrado o no tienes permisos');
  }

  // 2. Actualizar solo los campos enviados
  Object.assign(viaje, updateViajeDto);

  // 3. Guardar
  const viajeActualizado = await this.viajeRepository.save(viaje);

  this.logger.log(`Viaje ${idViaje} actualizado por admin ${idAdmin}`);

  return {
    message: 'Viaje actualizado correctamente',
    data: viajeActualizado
  };
}


   async getEstadisticasViajes(idAdmin: number): Promise<EstadisticasViajesDto> {
    this.logger.log(`Obteniendo estadísticas de viajes para admin ${idAdmin}`);

    // Suma total de todos los viajes activos (ingresos)
    const totalViajes = await this.viajeRepository
      .createQueryBuilder('viaje')
      .select('COALESCE(SUM(viaje.valor), 0)', 'total')
      .where('viaje.estado = :estado', { estado: ViajeEstado.ACTIVO })
      .andWhere('viaje.id_admin = :idAdmin', { idAdmin })
      .getRawOne();

      // Suma total de todos los viajes activos (numero de viajes)
    const totalNumeroViajes = await this.viajeRepository
      .createQueryBuilder('viaje')
      .select('COUNT(viaje.id_viaje)', 'numeroViajes')
      .where('viaje.estado = :estado', { estado: ViajeEstado.ACTIVO })
      .andWhere('viaje.id_admin = :idAdmin', { idAdmin })
      .getRawOne();

    // Suma de todos los gastos de viaje (solo de viajes activos)
    const totalGastosViaje = await this.viajeRepository
      .createQueryBuilder('viaje')
      .leftJoin('viaje.gastos_viaje', 'gastos_viaje')
      .select('COALESCE(SUM(gastos_viaje.valor), 0)', 'total')
      .where('viaje.estado = :estado', { estado: ViajeEstado.ACTIVO })
      .andWhere('viaje.id_admin = :idAdmin', { idAdmin })
      .getRawOne();

    // Suma de todos los gastos de camión (de los camiones que tienen viajes activos)
      // Nota: si sumamos gastos_camion desde viaje (JOIN), el mismo gasto se duplica
      // por cada viaje del camión. Por eso se suma directo desde gastos_camion.
      const totalGastosCamion = await this.gastosCamionRepository
        .createQueryBuilder('gastos_camion')
        .select('COALESCE(SUM(gastos_camion.valor), 0)', 'total')
        .where('gastos_camion.id_admin = :idAdmin', { idAdmin })
        .getRawOne();

    const ingresos = Number(totalViajes.total) || 0;
    const gastosViaje = Number(totalGastosViaje.total) || 0;
    const gastosCamion = Number(totalGastosCamion.total) || 0;
    const egresos = gastosViaje + gastosCamion;
    const total = Number(totalNumeroViajes.numeroViajes) || 0;

    

    return {
      total: total,
      ingresos: ingresos,
      egresos: egresos
    };
   }   


   async getEstadisticasGraficas(idAdmin: number): Promise<EstadisticasGraficasResponseDto> {
    this.logger.log(`Obteniendo estadísticas gráficas mensuales para admin ${idAdmin}`);

    const data: EstadisticasMesDto[] = [];
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const ahora = new Date();

    // Obtener datos de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesInicio = new Date(fechaMes.getFullYear(), fechaMes.getMonth(), 1);
      const mesFin = new Date(fechaMes.getFullYear(), fechaMes.getMonth() + 1, 0, 23, 59, 59, 999);

      // Calcular ingresos del mes (suma de valores de viajes)
      const ingresosResult = await this.viajeRepository
        .createQueryBuilder('viaje')
        .select('COALESCE(SUM(viaje.valor), 0)', 'total')
        .where('viaje.id_admin = :idAdmin', { idAdmin })
        .andWhere('viaje.fecha_inicio >= :mesInicio', { mesInicio })
        .andWhere('viaje.fecha_inicio <= :mesFin', { mesFin })
        .getRawOne();

      // Calcular gastos de viaje del mes
      const gastosViajeResult = await this.viajeRepository
        .createQueryBuilder('viaje')
        .leftJoin('viaje.gastos_viaje', 'gastos_viaje')
        .select('COALESCE(SUM(gastos_viaje.valor), 0)', 'total')
        .where('viaje.id_admin = :idAdmin', { idAdmin })
        .andWhere('viaje.fecha_inicio >= :mesInicio', { mesInicio })
        .andWhere('viaje.fecha_inicio <= :mesFin', { mesFin })
        .getRawOne();

      // Calcular gastos de camión del mes (de los camiones que tienen viajes en ese mes)
      // Nota: sumar gastos_camion desde viaje duplica filas si un camión tiene múltiples viajes.
      // Además, para el mes tiene más sentido filtrar por la fecha del gasto.
      const gastosCamionResult = await this.gastosCamionRepository
        .createQueryBuilder('gastos_camion')
        .select('COALESCE(SUM(gastos_camion.valor), 0)', 'total')
        .where('gastos_camion.id_admin = :idAdmin', { idAdmin })
        .andWhere('gastos_camion.fecha >= :mesInicio', { mesInicio })
        .andWhere('gastos_camion.fecha <= :mesFin', { mesFin })
        .getRawOne();

      const ingresos = Number(ingresosResult.total) || 0;
      const gastosViaje = Number(gastosViajeResult.total) || 0;
      const gastosCamion = Number(gastosCamionResult.total) || 0;
      const egresos = gastosViaje + gastosCamion;
      const balance = ingresos - egresos;

      data.push({
        mes: `${mesesNombres[fechaMes.getMonth()]} ${fechaMes.getFullYear()}`,
        balance: balance
      });
    }

    this.logger.log(`Estadísticas gráficas calculadas para ${data.length} meses`);

    return { data };
   }   





   /**
    * Obtiene informe detallado de viajes de un mes específico para un camión
    * @param idAdmin - ID del admin autenticado
    * @param mes - Mes en formato 1-12 (1=Enero, 12=Diciembre)
    * @param anio - Año del informe
    * @param idCamion - ID del camión para filtrar los viajes
    * @returns Informe mensual con balance y detalle de cada viaje del camión
    */
   async getEstadisticasInformes(
     idAdmin: number, 
     mes: number, 
     anio: number,
     idCamion: number
   ): Promise<InformeMensualDto> {
     this.logger.log(`Obteniendo informe mensual para admin ${idAdmin} - Mes: ${mes}/${anio} - Camión: ${idCamion}`);

     const mesesNombres = [
       'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
     ];

     // Validar mes
     if (mes < 1 || mes > 12) {
       throw new BadRequestException('El mes debe estar entre 1 y 12');
     }

     // Validar que el camión existe y pertenece al admin
     const camion = await this.camionRepository.findOne({
       where: { 
         id_camion: idCamion,
         admin: { id_admin: idAdmin }
       }
     });

     if (!camion) {
       this.logger.warn(`Camión ${idCamion} no encontrado o no pertenece al admin ${idAdmin}`);
       throw new NotFoundException('Camión no encontrado o no tienes permisos');
     }

     // Calcular fechas de inicio y fin del mes
     const mesInicio = new Date(anio, mes - 1, 1);
     const mesFin = new Date(anio, mes, 0, 23, 59, 59, 999);

     // Obtener todos los viajes del mes para el camión específico
     const viajes = await this.viajeRepository.find({
       where: {
         admin: { id_admin: idAdmin },
         camion: { id_camion: idCamion },
         fecha_inicio: Between(mesInicio, mesFin)
       },
       relations: ['camion', 'conductor', 'gastos_viaje'],
       order: { fecha_inicio: 'ASC' }
     });

     // Obtener todos los gastos del camión en el período del mes (se calcula una sola vez)
     const gastosCamionMes = await this.gastosCamionRepository
       .createQueryBuilder('gastos_camion')
       .select('COALESCE(SUM(gastos_camion.valor), 0)', 'total')
       .where('gastos_camion.id_camion = :idCamion', { idCamion })
       .andWhere('gastos_camion.id_admin = :idAdmin', { idAdmin })
       .andWhere('gastos_camion.fecha >= :mesInicio', { mesInicio })
       .andWhere('gastos_camion.fecha <= :mesFin', { mesFin })
       .getRawOne();

    //Obtener detalles de los gastos del camion en ese mes
    const gastosCamionDetalles = await this.gastosCamionRepository.find({
       where: {
         admin: { id_admin: idAdmin },
         camion: { id_camion: idCamion },
         fecha: Between(mesInicio, mesFin)
       },
       relations: ['camion', 'admin'],
       order: { fecha: 'ASC' }
     });
       

     const totalGastosCamionMes = Number(gastosCamionMes?.total) || 0;

     let ingresosTotales = 0;
     let contadorEgresosTotales = 0;
     let egresosTotales = 0;
     const detalleViajes: DetalleViajeInformeDto[] = [];
     const detalleGastosCamion: DettallesGastosCamionDto[] = [];

     //Proceso cada gasto
     for (const gasto of gastosCamionDetalles) {
      detalleGastosCamion.push({
        valor: gasto.valor,
        tipo_gasto: gasto.tipo_gasto,
        descripcion: gasto.descripcion,
        fecha: gasto.fecha
      });
     }

     // Procesar cada viaje
     for (const viaje of viajes) {
       // Calcular gastos de viaje
       const gastosViaje = viaje.gastos_viaje
         ?.filter(g => g.estado === 'activo')
         .reduce((sum, g) => sum + Number(g.valor), 0) || 0;

       const valorViaje = Number(viaje.valor) || 0;
       
      
       const balanceViaje = valorViaje - (gastosViaje );

       ingresosTotales += valorViaje;
       contadorEgresosTotales += (gastosViaje);
       egresosTotales = contadorEgresosTotales + totalGastosCamionMes;

       detalleViajes.push({
         id_viaje: viaje.id_viaje,
         num_manifiesto: viaje.num_manifiesto,
         lugar_origen: viaje.lugar_origen,
         lugar_destino: viaje.lugar_destino,
         fecha_inicio: viaje.fecha_inicio,
         camion: viaje.camion.placa,
         conductor: viaje.conductor.nombre,
         valor_viaje: valorViaje,
         gastos_viaje: gastosViaje,
         balance_viaje: balanceViaje
       });
     }

     const balanceTotal = ingresosTotales - egresosTotales;

     this.logger.log(
       `Informe mensual calculado para camión ${camion.placa}: ${viajes.length} viajes, ` 
     );

     return {
       mes: mesesNombres[mes - 1],
       anio: anio,
       total_viajes: viajes.length,
       ingresos_totales: ingresosTotales,
       egresos_totales: egresosTotales,
       balance_total: balanceTotal,
       detalle_viajes: detalleViajes,
       detalle_gastos_camion: detalleGastosCamion,
     };
   }   
}
