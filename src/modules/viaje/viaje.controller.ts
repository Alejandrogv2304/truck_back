import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ViajeService } from './viaje.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { RequestWithUser } from 'src/types/request-with-user.interface';
import { UpdateViajeDto } from './dto/update-viaje.dto';

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

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllViajes(
      @Query() paginationQuery: PaginationQueryDto,
      @Req() req: RequestWithUser
    ) {
      const idAdmin = req.user.sub;
      return await this.viajeService.getAllViajes(paginationQuery, idAdmin);
    }


     @UseGuards(JwtAuthGuard)
             @Patch('/:id')
                async updateViaje(
                @Body() updateViajeDto: UpdateViajeDto,
                @Param('id', ParseIntPipe) idViaje: number,
                @Req() req: RequestWithUser
              ) {
                const idAdmin = req.user.sub;
                return await this.viajeService.updateViaje(idViaje,updateViajeDto,idAdmin);
              }


    @UseGuards(JwtAuthGuard)
          @Get('/:id')
          async getOneViaje(
          @Param('id', ParseIntPipe) id: number,
          @Req() req: RequestWithUser
          ) {
          const idAdmin = req.user.sub;
          return await this.viajeService.getOneViaje(id,idAdmin);
           }
    
}
