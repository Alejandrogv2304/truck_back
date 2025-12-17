import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CamionService } from './camion.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

import type{ RequestWithUser } from 'src/types/request-with-user.interface';
import { UpdateCamionDto } from './dto/update-camion.dto';

@Controller('api/v1/camion')
export class CamionController {
     constructor(private readonly camionService: CamionService) {}
     
     @UseGuards(JwtAuthGuard)
     @Post()
        async createCamion(
        @Body() CreateCamionDto: CreateCamionDto,
        @Req() req: RequestWithUser
      ) {
        const id = req.user.sub;
        return await this.camionService.createCamion(CreateCamionDto,id);
      }

       @UseGuards(JwtAuthGuard)
       @Get()
        async getCamiones(
        @Req() req: RequestWithUser
      ) {
        const id = req.user.sub;
        return await this.camionService.getAllCamiones(id);
      }

       @UseGuards(JwtAuthGuard)
       @Get('/select')
        async getCamionesIdAndPlaca(
        @Req() req: RequestWithUser
      ) {
        const id = req.user.sub;
        return await this.camionService.getAllCamionesIdAndPlaca(id);
      }

      

     @UseGuards(JwtAuthGuard)
     @Patch(':id/change-state')
     async toggleEstado(@Param('id', ParseIntPipe) id: number) {
     return await this.camionService.updateStateCamion(id);
    }

     @UseGuards(JwtAuthGuard)
     @Patch('/:id')
        async updateCamion(
        @Body() updateCamionDto: UpdateCamionDto,
        @Param('id', ParseIntPipe) id: number
      ) {
        
        return await this.camionService.updateCamion(id,updateCamionDto);
      }

       @UseGuards(JwtAuthGuard)
       @Get('/:id')
        async getOneCamion(
        @Param('id', ParseIntPipe) id: number
      ) {
        return await this.camionService.getOneCamion(id);
      }
}
