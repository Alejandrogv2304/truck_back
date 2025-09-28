import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}
    @Post('/login')
    async Login(
        @Body() loginDto: LoginDto
    ){
     const result = await this.authService.login(loginDto);
     return {
      message: result.message,
      correo: result.correo,
      id: result.id
    };
    }
}
