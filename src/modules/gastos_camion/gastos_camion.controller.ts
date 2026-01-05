import { Body, Controller, Delete, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { GastosCamionService } from './gastos_camion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGastoCamionDto } from './dto/create-gasto-camion.dto';
import type { RequestWithUser } from 'src/types/request-with-user.interface';

@Controller('api/v1/gastos-camion')
export class GastosCamionController {
    constructor (private readonly gastosCamionService: GastosCamionService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
     async createGastoCamion(
                        @Body() createGastoCamionDto: CreateGastoCamionDto,
                        @Req() req: RequestWithUser
                      ) {
                        const idAdmin = req.user.sub;
                        return await this.gastosCamionService.createGastoCamion(idAdmin, createGastoCamionDto);
                      }



     @UseGuards(JwtAuthGuard)
                     @Delete('/:idGastoCamion')
                        async deleteGastoCamion(
                        @Req() req: RequestWithUser,
                        @Param('idGastoCamion', ParseIntPipe) idGastoCamion: number
                      ) {
                        const idAdmin = req.user.sub;
                        return await this.gastosCamionService.deleteGastoCamion(idAdmin, idGastoCamion);
                      }
}
