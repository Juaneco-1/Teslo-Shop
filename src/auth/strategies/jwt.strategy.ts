import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
    @InjectRepository (User)
    private readonly userRepository:Repository<User>,
    configService:ConfigService
    ){


        super({
            secretOrKey:configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }



    async validate(payload:JwtPayload):Promise<User>{

        
        
            
        
        //CUando el token es valido y no ha expirado
        const {id}=payload;

        const user= await this.userRepository.findOneBy({id});

        if(!user) throw new UnauthorizedException('Token Invalid')
        if(!user.isActive) throw new UnauthorizedException('User is inactive, talk with admin');

        console.log({user});
        //Se regresa en la request 
        return user;
    }
}