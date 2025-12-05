import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ViajeService } from './viaje.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateViajeDto } from './dto/create-viaje.dto';
import type { RequestWithUser } from 'src/types/request-with-user.interface';

@Controller('api/v1/viaje')
export class ViajeController {

    constructor(private readonly viajeService: ViajeService) {}
    
    @UseGuards(JwtAuthGuard)
             @Post()
                async createViaje(
                @Body() createViajeDto: CreateViajeDto,
                @Req() req: RequestWithUser
              ) {
                const idAdmin = req.user.sub;
                return await this.viajeService.createViaje(createViajeDto,idAdmin);
              }
}
