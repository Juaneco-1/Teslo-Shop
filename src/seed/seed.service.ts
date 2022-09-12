import { Inject, Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { initialData } from './data/seed_data';


@Injectable()
export class SeedService {
  
  
  constructor(private readonly productService:ProductService ){

  }

  async runSeed(){
    /* return 'Seed executed'; */
    //Eliminar los productos si hay en base de datos, implemento el metodo que esta en el
    //servicio de producto

    await this.insertNewProducts();
    return 'Seed Executed';
    
  }

  async insertNewProducts(){
    await this.productService.deleteAllProducts();
    
    const product=initialData.products;

    const insertPromises=[];
    product.forEach(product=>{
        insertPromises.push(this.productService.create(product));
    })

    await Promise.all(product);




  }
}
