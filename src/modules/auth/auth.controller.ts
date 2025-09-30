import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}
    @Post('/login')
    async Login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ){
     const result = await this.authService.login(loginDto);
     return {
      message: result.message,
      access_token: result.access_token,
      admin: result.admin
    };
    }
}
