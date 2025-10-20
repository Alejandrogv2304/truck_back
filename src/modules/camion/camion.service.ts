import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Camion, CamionEstado } from './entities/camion.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CreateCamionResponseDto, ResponseGetCamionesDto } from './dto/create-response.dto';
import { Admin } from '../admin/entities/admin.entity';
import { UpdateCamionDto } from './dto/update-camion.dto';

@Injectable()
export class CamionService {
    constructor(
            @InjectRepository(Camion)
            private readonly camionRepository: Repository<Camion>,
        ){}

     async createCamion(CreateCamionDto:CreateCamionDto, id_admin:number): Promise<CreateCamionResponseDto>{
          // 1. Validar correo duplicado
        const existingCamion = await this.camionRepository.findOne({
         where: { placa: CreateCamionDto.placa },
         });
         if (existingCamion) {
         throw new BadRequestException('La placa ya está registrada');
         }
    
         
          try{
          const newCamion = this.camionRepository.create({
          placa: CreateCamionDto.placa,
          modelo: CreateCamionDto.modelo,
          admin: { id_admin: id_admin } as Admin,
          })
        
    
        const camion = await this.camionRepository.save(newCamion);
    
        return { message: `El camion fue creado correctamente`,
            CamionId: camion.id_camion,
         };
         } catch {
            throw new InternalServerErrorException('Ocurrió un error al registrar el camión')
         }
        }

        async getAllCamiones(id_admin:number):Promise<ResponseGetCamionesDto[]>{
        const camiones = await this.camionRepository.find({
          where:  { admin: {
                id_admin: id_admin, 
            }, 
         },
        })

        if(camiones.length === 0){
         throw new NotFoundException('No se encontraron camiones asociados a este admin')
        }

        return camiones.map(camion => this.mapToResponseDto(camion));
        }

        private mapToResponseDto(camion: Camion): ResponseGetCamionesDto {
      return {
          id_camion: camion.id_camion,
          placa: camion.placa,
          modelo: camion.modelo,
          estado: camion.estado,
      };
  }
  
  //Método para obtener un camión según su id
  async getOneCamion(id_camion: number):Promise<ResponseGetCamionesDto>{

   const camion = await this.camionRepository.findOne({
      where: { id_camion: id_camion}
   })

   if(!camion){
      throw new NotFoundException('No se encontraron los datos de ese camion')
   }
    return camion;
}

async updateStateCamion(id_camion: number): Promise<{ message: string }> {
    // Buscar camion
    const camion = await this.camionRepository.findOne({ where: { id_camion } });

    if (!camion) {
      throw new NotFoundException(`Ruta con id ${id_camion} no encontrada`);
    }

    // Actualizar estado
    try {
      camion.estado =
        camion.estado === CamionEstado.ACTIVO
          ? CamionEstado.INACTIVO
          : CamionEstado.ACTIVO;
      await this.camionRepository.save(camion);
      return {
        message: `El camion con id ${camion.id_camion} fue actualizado correctamente`,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar el estado del camion',
      );
    }
  }


  async updateCamion(id_camion:number, updateCamionDto: UpdateCamionDto):Promise<{message:string}>{
  
    const camion = await this.camionRepository.findOne({
      where:{id_camion: id_camion}
    })

    if(!camion){
      throw new NotFoundException('No se encontró el camion con ese id')
    }


       if(updateCamionDto.placa){
        const whereCondition: FindOptionsWhere<Camion> = {
            placa: updateCamionDto.placa,
            id_camion: Not(id_camion), // Excluimos el camión actual
        };

        const existingPlaca = await this.camionRepository.findOne({
            where: whereCondition,
        });

        if (existingPlaca) {
            // Usamos ConflictException (HTTP 409) para indicar violación de unicidad
            throw new ConflictException(`La placa ${updateCamionDto.placa} ya está registrada en otro camión.`);
        }
      }

    try {
     
        const result = await this.camionRepository.update(
            id_camion, 
            updateCamionDto 
        );

        
        if (result.affected === 0) {
             
             throw new NotFoundException(`No se encontró el camión con ID ${id_camion}`); 
        }

        return {
            message: `El camión con ID ${id_camion} fue actualizado correctamente`,
        };
    } catch {
      throw new Error('Ocurrió un error al actualizar el camión')
    }
  }



  }
