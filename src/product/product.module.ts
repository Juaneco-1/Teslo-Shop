import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports:[TypeOrmModule.forFeature([Product,ProductImage])]//Todas las entidades que el modulo esta definiendo
  //Aqui solo tenemos la entidad producto
  ,exports:[ProductService,TypeOrmModule]
})
export class ProductModule {}
