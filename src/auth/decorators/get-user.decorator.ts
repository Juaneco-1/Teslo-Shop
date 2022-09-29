import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser=createParamDecorator(
    (data,ctx:ExecutionContext)=>{

    let user='';
    const req =ctx.switchToHttp().getRequest();
    if(data){
         user=req.user[data];
    }
    else{
        user=req.user;
    }
    
    
    

    if(!user) throw new InternalServerErrorException('User not found (request)');

    return user;
});