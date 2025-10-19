import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CamionService } from './camion.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

import type{ RequestWithUser } from 'src/types/request-with-user.interface';

@Controller('api/v1/camion')
export class CamionController {
     constructor(private readonly camionService: CamionService) {}
     
     @UseGuards(JwtAuthGuard)
     @Post()
        async createAdmin(
        @Body() CreateCamionDto: CreateCamionDto,
        @Req() req: RequestWithUser
      ) {
        const id = req.user.sub;
        return await this.camionService.createCamion(CreateCamionDto,id);
      }

       @UseGuards(JwtAuthGuard)
       @Get()
        async getCamniones(
        @Req() req: RequestWithUser
      ) {
        const id = req.user.sub;
        return await this.camionService.getAllCamiones(id);
      }

       @UseGuards(JwtAuthGuard)
       @Get('/:id')
        async getOneCamion(
        @Param('id', ParseIntPipe) id: number
      ) {
        return await this.camionService.getOneCamion(id);
      }

      @UseGuards(JwtAuthGuard)
     @Patch(':id/change-state')
     async toggleEstado(@Param('id', ParseIntPipe) id: number) {
     return await this.camionService.updateStateCamion(id);
    }
}
