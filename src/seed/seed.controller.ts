import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/validRoles';
import { SeedService } from './seed.service';


@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  

  @Get()
  /* @Auth(ValidRoles.admin) */
  executeSeed() {
    return this.seedService.runSeed();
  }

  
}
