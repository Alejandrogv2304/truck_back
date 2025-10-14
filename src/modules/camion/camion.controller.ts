import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CamionService } from './camion.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@Controller('api/v1/camion')
export class CamionController {
     constructor(private readonly camionService: CamionService) {}
     
     @UseGuards(JwtAuthGuard)
     @Post()
        async createAdmin(
        @Body() CreateCamionDto: CreateCamionDto,
        @Req() req
      ) {
        const id = req.user.sub;
        return await this.camionService.createCamion(CreateCamionDto,id);
      }
}
