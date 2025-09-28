import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private adminService: AdminService
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

    return {
        message: 'Login Exitoso',
        correo: correo,
        id: admin.id_admin
    }
     }
}
