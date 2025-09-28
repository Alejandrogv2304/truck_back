import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('api/v1/admin')
export class AdminController {
   constructor(private readonly adminService: AdminService) {}
    @Post()
    async createAdmin(
    @Body() CreateAdminDto: CreateAdminDto,
  ) {
    return await this.adminService.createAdmin(CreateAdminDto);
  }

}
