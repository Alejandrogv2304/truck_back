import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { GastosViajeService } from './gastos_viaje.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGastoViajeDto } from './dto/create-gasto-viaje.dto';
import type { RequestWithUser } from 'src/types/request-with-user.interface';

@Controller('/api/v1/gastos-viaje')
export class GastosViajeController {
    constructor (private readonly gastosViajeService: GastosViajeService) {}


     @UseGuards(JwtAuthGuard)
                 @Post('/:idViaje')
                    async createGastoViaje(
                    @Body() createGastoViajeDto: CreateGastoViajeDto,
                    @Req() req: RequestWithUser,
                    @Param('idViaje', ParseIntPipe) idViaje: number
                  ) {
                    const idAdmin = req.user.sub;
                    return await this.gastosViajeService.createGastoViaje(createGastoViajeDto,idAdmin, idViaje);
                  }
    


}
