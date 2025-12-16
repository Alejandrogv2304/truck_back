import { Body, Controller, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
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


    @UseGuards(JwtAuthGuard)
             @Patch(':id/change-state')
             async toggleEstado(@Param('id', ParseIntPipe) id: number,
             @Req() req: RequestWithUser) {
             const idAdmin = req.user.sub;
             return await this.viajeService.updateStateViaje(id,idAdmin);
            }
    
}
