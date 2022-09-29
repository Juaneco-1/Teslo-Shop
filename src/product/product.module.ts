import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports:[TypeOrmModule.forFeature([Product,ProductImage]),AuthModule]//Todas las entidades que el modulo esta definiendo
  //Aqui solo tenemos la entidad producto
  ,exports:[ProductService,TypeOrmModule]
})
export class ProductModule {}
