import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, retry } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { ValidRoles } from '../interfaces/validRoles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector:Reflector
  ){
    
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles:string[]=this.reflector.get(META_ROLES,context.getHandler());
    console.log(validRoles);

    if(!ValidRoles) return true;
    if(validRoles.length===0) return true;
    const req=context.switchToHttp().getRequest();
    const user=req.user as User;

    for (const role of user.roles) {
      if(validRoles.includes(role)){
        return true;
      }
    }
    throw new ForbiddenException(`User ${user.fullName} needs a valid role ${validRoles}`);
  }
}
