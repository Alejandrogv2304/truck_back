import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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


  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    // req.user viene de JwtStrategy.validate
    const { id_admin } = req.user;

    return this.authService.findOneById(id_admin);
  }
}
