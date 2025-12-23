import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Viaje } from '../viaje/entities/viaje.entity';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { GastosViaje } from './entities/gastos_viaje.entity';
import { CreateGastoViajeDto } from './dto/create-gasto-viaje.dto';
import { CreateGastoViajeResponseDto } from './dto/create-gasto-response.dto';

@Injectable()
export class GastosViajeService {

    private readonly logger = new Logger(GastosViajeService.name);
         constructor(
             @InjectRepository(Viaje)
             private readonly viajeRepository: Repository<Viaje>,
             @InjectRepository(Admin)
             private readonly adminRepository: Repository<Admin>,
             @InjectRepository(GastosViaje)
             private readonly gastosViajeRepository: Repository<GastosViaje>,
         ){}


          /**
               * Crea un nuevo gasto de viaje validando todas las relaciones
               * @param createGastoViajeDto - Datos del viaje
               * @param idAdmin - ID del admin autenticado (ownership)
               * @returns Confirmación con datos del gasto deviaje creado
               */
              async createGastoViaje(
                 createGastoViajeDto: CreateGastoViajeDto,
                 idAdmin: number,
                 idViaje:number
              ): Promise<CreateGastoViajeResponseDto> {
                 this.logger.log(`Creando el gasto de viaje para admin ${idAdmin}`);
         
                 // 1. Verificar que el admin existe
                 const admin = await this.adminRepository.findOne({
                   where: { id_admin: idAdmin }
                 });
                 
                 if (!admin) {
                   this.logger.warn(`Intento de crear viaje con admin inexistente: ${idAdmin}`);
                   throw new NotFoundException('Admin no encontrado');
                 }
         
                 // 2. Validar que el viaje existe y pertenece al admin
                 const viaje = await this.viajeRepository.findOne({
                   where: { 
                     id_viaje: idViaje,
                     admin: { id_admin: idAdmin }
                   }
                 });
                 
                 if (!viaje) {
                   this.logger.warn(`Viaje ${idViaje} no encontrado o no pertenece al admin ${idAdmin}`);
                   throw new NotFoundException('Viaje no encontrado o no tienes permisos');
                 }
         
                if(viaje.estado !== 'activo'){
                   this.logger.warn(`Intento de crear gasto de viaje para un viaje inactivo: Viaje ${idViaje}, Admin ${idAdmin}`);
                   throw new InternalServerErrorException('No se pueden agregar gastos a un viaje inactivo');
                }
           
                 // 5. Crear el viaje
                 try {
                   const newGastoViaje = this.gastosViajeRepository.create({
                     tipo_gasto: createGastoViajeDto.tipo_gasto,
                     viaje: viaje,
                     valor: createGastoViajeDto.valor,   
                     ...(createGastoViajeDto.estado && { estado: createGastoViajeDto.estado }),   
                     admin: admin,
                     
                   });
               
                   const gastoViaje = await this.gastosViajeRepository.save(newGastoViaje);
                   
                   this.logger.log(
                     `Gasto de viaje creado exitosamente: ID ${gastoViaje.id_gasto_viaje}, Admin: ${gastoViaje.admin}`
                   );
           
                   return { 
                     message: 'El gasto de viaje fue creado correctamente',
                     data: {
                       id_gasto_viaje: gastoViaje.id_gasto_viaje,
                       valor: gastoViaje.valor,
                       estado: gastoViaje.estado,
                       tipo_gasto: gastoViaje.tipo_gasto, 
                     }
                   };
                 } catch (error) {
                   this.logger.error(
                     `Error al crear gasto de viaje para admin ${idAdmin}: ${error.message}`,
                     error.stack
                   );
                   throw new InternalServerErrorException('Ocurrió un error al registrar el gasto de viaje');
                 }
              }
         
         /**
          * Elimina permanentemente un gasto de viaje verificando permisos
          * @param idAdmin - ID del admin autenticado
          * @param idGastoViaje - ID del gasto a eliminar
          * @returns Confirmación de eliminación con filas afectadas
          */
         async deleteGastoViaje(
          idAdmin: number,
          idGastoViaje: number
         ) {
          this.logger.log(`Eliminando el gasto de viaje ${idGastoViaje} para admin ${idAdmin}`);

          try {
            // 1. Validar que el gasto existe y pertenece al admin
            const gastoViaje = await this.gastosViajeRepository.findOne({
              where: { 
                id_gasto_viaje: idGastoViaje,
                admin: { id_admin: idAdmin }
              },
              relations: ['admin']
            });

            if (!gastoViaje) {
              this.logger.warn(`Gasto de viaje ${idGastoViaje} no encontrado o no pertenece al admin ${idAdmin}`);
              throw new NotFoundException('Gasto de viaje no encontrado o no tienes permisos');
            }

            // 2. Eliminar permanentemente el gasto
            const result = await this.gastosViajeRepository.delete(idGastoViaje);

            if (result.affected === 0) {
              throw new InternalServerErrorException('No se pudo eliminar el gasto de viaje');
            }

            this.logger.log(
              `Gasto de viaje eliminado exitosamente: ID ${idGastoViaje}, Admin: ${idAdmin}`
            );

            return {
              message: 'El gasto de viaje fue eliminado correctamente',
              data: {
                id_gasto_viaje: idGastoViaje,
                affected: result.affected
              }
            };
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw error;
            }
            this.logger.error(
              `Error al eliminar gasto de viaje ${idGastoViaje} para admin ${idAdmin}: ${error.message}`,
              error.stack
            );
            throw new InternalServerErrorException('Ocurrió un error al eliminar el gasto de viaje');
          }
         }
}
