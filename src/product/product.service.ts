import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { paginatioDto } from '../common/dtos/pagination.dto';
import {validate as isUUID}from 'uuid';
@Injectable()
export class ProductService {

  private readonly logger= new Logger('ProductService');

  constructor(
   @InjectRepository(Product)
   private readonly productRepository:Repository<Product> ){

  }


  async create(createProductDto: CreateProductDto) {
    
    try {
      const product= this.productRepository.create(createProductDto);//Instancio un producto con sus propiedades
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      
      this.handleDBExeptions(error);
      
    }



  }

  async findAll(paginatioDto:paginatioDto) {

    const {limit=10,offset=0}=paginatioDto;
    const Products=await this.productRepository.find({
      take:limit,
      skip:offset
    });
    
    return Products


  }

  async findOne(term: string) {
    
    let product:Product;
    
    if(isUUID(term)){

      product=await this.productRepository.findOneBy({id:term});
    }
    else{
      /* product=await this.productRepository.findOneBy({slug:term}); */

      const queryBuilder=this.productRepository.createQueryBuilder();

      product= await queryBuilder
      .where( 'UPPER(title) =:title or slug =:slug'
      ,{
        title:term.toUpperCase(),
        slug:term.toLocaleLowerCase()
      }).getOne();
    }
    
    if(!product) throw new NotFoundException('Product with that id not found');

    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const product= await this.productRepository.preload({
      id,
      ...updateProductDto
    })

    if(!product) throw new NotFoundException(`Product with ${id} not found`);

    try {
      await this.productRepository.save(product);  
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
    

  }

  async remove(id: string) {
    
    const removeProd= await this.findOne(id);

    await this.productRepository.remove(removeProd);

  }

  handleDBExeptions(error:any){
    
    if(error.code==='23505') throw new BadRequestException(`Error ${error.detail}`)

    this.logger.error(error);
    throw new InternalServerErrorException("Server error, check logs");

  }

}
