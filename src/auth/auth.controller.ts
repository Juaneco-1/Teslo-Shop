import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-header.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUSerDto,LoginUSerDto } from './dto/';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/validRoles';
import { Auth } from './decorators/auth.decorator';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUSerDto: CreateUSerDto) {
    return this.authService.create(createUSerDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto:LoginUSerDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user);
  }


  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    /* @Req() request:Express.Request */

    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @RawHeaders() rawHeader:string[]
  ){
    
    return {
      user,userEmail,rawHeader
    };
  }

  @Get('private2')
  //@SetMetadata('roles',['admin','super-user'])
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(),UserRoleGuard)
  testingPrivate(
    @GetUser() user:User
  ){
      return {
        ok:true,
        user
      }
  }

  @Get('private3')
  /* //@SetMetadata('roles',['admin','super-user'])
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(),UserRoleGuard) */
  @Auth(ValidRoles.user,ValidRoles.admin)
  testingPrivateR(
    @GetUser() user:User
  ){
      return {
        ok:true,
        user
      }
  }

  
}
