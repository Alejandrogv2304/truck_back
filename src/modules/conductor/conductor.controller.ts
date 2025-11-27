import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/types/request-with-user.interface';
import { UpdateConductorDto } from './dto/update-conductor.dto';

@Controller('api/v1/conductor')
export class ConductorController {

    constructor(private readonly conductorService: ConductorService) {}

    @UseGuards(JwtAuthGuard)
         @Post()
            async createConductor(
            @Body() CreateConductorDto: CreateConductorDto,
            @Req() req: RequestWithUser
          ) {
            const id = req.user.sub;
            return await this.conductorService.createConductor(CreateConductorDto,id);
          }
    

     @UseGuards(JwtAuthGuard)
           @Get()
            async getCamiones(
            @Req() req: RequestWithUser
          ) {
            const idAdmin = req.user.sub;
            return await this.conductorService.getAllConductores(idAdmin);
          }


     @UseGuards(JwtAuthGuard)
         @Patch(':id/change-state')
         async toggleEstado(@Param('id', ParseIntPipe) id: number,
         @Req() req: RequestWithUser) {
         const idAdmin = req.user.sub;
         return await this.conductorService.updateStateConductor(id,idAdmin);
        }


      @UseGuards(JwtAuthGuard)
         @Patch('/:id')
            async updateConductor(
            @Body() updateConductorDto: UpdateConductorDto,
            @Param('id', ParseIntPipe) idConductor: number,
            @Req() req: RequestWithUser
          ) {
            const idAdmin = req.user.sub;
            return await this.conductorService.updateConductor(idConductor,updateConductorDto,idAdmin);
          }
}
