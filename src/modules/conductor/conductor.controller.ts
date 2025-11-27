import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/types/request-with-user.interface';

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
    
}
