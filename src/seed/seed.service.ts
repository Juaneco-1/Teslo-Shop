import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductService } from '../product/product.service';
import { initialData } from './data/seed_data';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class SeedService {
  
  
  constructor(private readonly productService:ProductService,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
    ){

  }

  async runSeed(){
    /* return 'Seed executed'; */
    //Eliminar los productos si hay en base de datos, implemento el metodo que esta en el
    //servicio de producto

    await this.deleteTables();
    const adminUser=await this.insertUsers();

    await this.insertNewProducts(adminUser);
    
    return 'Seed Executed';
    
  }

  private async deleteTables(){

    await this.productService.deleteAllProducts();

    const queryBuilder= this.userRepository.createQueryBuilder();
    await queryBuilder.
    delete()
    .where({})
    .execute()
  }

  async insertNewProducts(user:User){
    await this.productService.deleteAllProducts();
    
    const product=initialData.products;

    const insertPromises=[];
    product.forEach(product=>{
        insertPromises.push(this.productService.create(product,user));
    })

    await Promise.all(product);




  }
  private async insertUsers(){
    const seedUsers=initialData.users;

    const users:User[]=[];

    seedUsers.forEach(user=>{
      users.push(this.userRepository.create(user))
    });

    const dbUsers=await this.userRepository.save(seedUsers);

    return dbUsers[0];


  }
}
