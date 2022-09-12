import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { paginatioDto } from '../common/dtos/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
import {validate as isUUID}from 'uuid';
@Injectable()
export class ProductService {

  private readonly logger= new Logger('ProductService');

  constructor(
   @InjectRepository(Product)
   private readonly productRepository:Repository<Product>,
   @InjectRepository(ProductImage)
   private readonly productoImageRepository:Repository<ProductImage>,
   private readonly dataSource:DataSource
   ){

  }


  async create(createProductDto: CreateProductDto) {
    

    try {

      const { images=[],...productDetails }=createProductDto;
      const product= this.productRepository.create({
        ...productDetails,
        images:images.map(images=>this.productoImageRepository.create({url:images}))
      });//Instancio un producto con sus propiedades
      await this.productRepository.save(product);

      return {...product,images};
    } catch (error) {
      
      this.handleDBExeptions(error);
      
    }



  }

  async findAll(paginatioDto:paginatioDto) {

    const {limit=10,offset=0}=paginatioDto;
    const Products=await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true
      }
    });
    
    /* return Products */

    return Products.map(product=>({
      ...product,
      images:product.images.map(img=>img.url)//SAco las url de las imagenes y solo devuelvo eso
    }))


  }

  async findOne(term: string) {
    
    let product:Product;
    
    if(isUUID(term)){

      product=await this.productRepository.findOneBy({id:term});
    }
    else{
      /* product=await this.productRepository.findOneBy({slug:term}); */

      const queryBuilder=this.productRepository.createQueryBuilder('product');

      product= await queryBuilder
      .where( 'UPPER(title) =:title or slug =:slug'
      ,{
        title:term.toUpperCase(),
        slug:term.toLocaleLowerCase()
      })
      .leftJoinAndSelect('product.images','prodImages')//Se hace este left join para que aparezcan las imagenes de la relacion
      //Ya que con titulo y slug se busca con query builder
      .getOne();
    }
    
    if(!product) throw new NotFoundException('Product with that id not found');

    return product;

  }

  async findOnePlain(term:string){
    const {images=[],...rest}= await this.findOne(term);

    return{
      ...rest,
      images:images.map(img=>img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    

    const{images,...toUpdate}=updateProductDto;
    const product= await this.productRepository.preload({
      id,
      ...toUpdate,
    })

    if(!product) throw new NotFoundException(`Product with ${id} not found`);

    //CReate Query Runner
    const queryRunner=this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      /* await this.productRepository.save(product);  
      return product; */

      if(images){

        await queryRunner.manager.delete(ProductImage,
          {
            product:{id}
          }
          )
        product.images=images.map(images=>this.productoImageRepository.create({url:images}))
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return this.findOnePlain(id);
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async deleteAllProducts(){
    const query= this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      
    }
  }

}
