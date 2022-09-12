import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductService } from '../product/product.service';
import { ProductModule } from '../product/product.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[ProductModule]
})
export class SeedModule {}
