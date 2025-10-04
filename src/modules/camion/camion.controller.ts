import { Body, Controller, Post } from '@nestjs/common';
import { CreateCamionDto } from './dto/create-camion.dto';
import { CamionService } from './camion.service';

@Controller('api/v1/camion')
export class CamionController {
     constructor(private readonly camionService: CamionService) {}
    @Post()
        async createAdmin(
        @Body() CreateCamionDto: CreateCamionDto,
      ) {
        return await this.camionService.createCamion(CreateCamionDto);
      }
}
