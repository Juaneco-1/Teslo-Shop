import { Injectable, Logger, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUSerDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { LoginUSerDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private logger=new Logger;
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly jwtService:JwtService
  ){
    
  }

  async create(createUserDto: CreateUSerDto) {
    
    const {password,...userData}=createUserDto;
    try {
      const user=await this.userRepository.create({
        ...userData,
        password:bcrypt.hashSync(password,10)
      });
      await this.userRepository.save(user);

      delete user.password;
      return user;

      //TODO : Retornar el jwt de acceso

      return {
        ...user,
        token:this.getJwtToken({id:user.id})
      }

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login( loginUserDto:LoginUSerDto){
      
    const {password,email}=loginUserDto;
    
    const user= await this.userRepository.findOne({
      where:{email},
      select:{email:true,password:true,id:true}
    });

    if(!user){
      throw new UnauthorizedException('credentials are not valid')
    }

    if(!bcrypt.compareSync(password,user.password))
    throw new UnauthorizedException('credentials are not valid')

    return {
      ...user,
      token:this.getJwtToken({id:user.id})
    }
    //TODO: retornar jwt



  }
  checkAuthStatus(user:User){

    return{
      ...user,
      token:this.getJwtToken({id:user.id})
    }
  }

  private getJwtToken(payload:JwtPayload){

    const token =this.jwtService.sign(payload);

    return token;
  }

  private handleDBErrors(error:any){
    
    if(error.code==='23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(error);

    throw new InternalServerErrorException('Please check server log errors')
  }

  
}
