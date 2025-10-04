import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Camion } from './entities/camion.entity';
import { Repository } from 'typeorm';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CreateCamionResponseDto } from './dto/create-response.dto';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class CamionService {
    constructor(
            @InjectRepository(Camion)
            private readonly camionRepository: Repository<Camion>,
        ){}

     async createCamion(CreateCamionDto:CreateCamionDto): Promise<CreateCamionResponseDto>{
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
          admin: { id_admin: CreateCamionDto.id_admin } as Admin,
          })
        
    
        const camion = await this.camionRepository.save(newCamion);
    
        return { message: `El camion fue creado correctamente`,
            CamionId: camion.id_camion,
         };
         } catch {
            throw new InternalServerErrorException('Ocurrió un error al registrar el camión')
         }
        }
}
