import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcryptjs';
import { CreateAdminResponseDto } from './dto/response.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ){}
    async createAdmin(CreateAdminDto:CreateAdminDto): Promise<CreateAdminResponseDto>{
      // 1. Validar correo duplicado
    const existingAdmin = await this.adminRepository.findOne({
     where: { correo: CreateAdminDto.correo },
     });
     if (existingAdmin) {
     throw new BadRequestException('El correo ya está registrado.');
     }

     try {
        //Encriptación de la contraseña
     const PasswordAdmin =CreateAdminDto.password ;

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(PasswordAdmin, salt);

      const newAdmin = this.adminRepository.create({
      nombre: CreateAdminDto.nombre,
      apellido: CreateAdminDto.apellido,
      correo: CreateAdminDto.correo,
      hash,
      salt,
      estado: 'Activo',
      fecha_creacion: new Date(),
    });

    const Admin = await this.adminRepository.save(newAdmin);

    return { message: `El usuario fue creado correctamente`,
        adminId: Admin.id_admin,
        correo: Admin.correo
     };
     } catch (error) {
        throw new InternalServerErrorException('Ocurrió un error al registrar el usuario')
     }
    }
     async findByEmail(correo: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { correo } });
  }
}
