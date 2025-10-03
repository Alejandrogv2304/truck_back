import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../admin/entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


type AdminSafe = Omit<Admin, 'hash' | 'salt' | 'fecha_creacion'> 

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
    constructor(
        private adminService: AdminService,
        private jwtService: JwtService,
        
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ){}
     async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;
    // 1. Buscar usuario
    const admin = await this.adminService.findByEmail(correo);
    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

   // 3. Crear payload completo para access token
    const payloadAccess = {
      sub: admin.id_admin,
      correo: admin.correo,
      nombres: admin.nombre,
    };

    

    // 5. Generar tokens
    const access_token = await this.jwtService.signAsync(payloadAccess, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.DURACION_ACCESS_TOKEN,
    });

   
    return {
      message: 'Login exitoso',
      access_token,
      admin: {
        id: admin.id_admin,
        nombres: admin.nombre,
        correo: admin.correo
      },
    };
     }

    async findOneById(id:number): Promise<AdminSafe | null> {

     
    const admin = await this.adminRepository.findOne({
      where: { id_admin: id }
    });

    if (!admin) return null;

    // Excluir hash y salt
    const { hash, salt,fecha_creacion, ...rest } = admin;


    return {
      ...rest
    };
  }

}
