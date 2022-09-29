import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/file-filter.helper';
import { fileNamer } from './helpers/file-namer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
   private readonly configservice:ConfigService) {}


  @Get('product/:imageName')
  findProductImage(
   @Param('imageName') imageName:string,
   @Res() res:Response){
      
      const path=this.filesService.getStaticProductImage(imageName);

      res.sendFile(path);
  }
    
   @Post('product')
   @UseInterceptors(FileInterceptor('file',{
      fileFilter:fileFilter,
      storage:diskStorage({
         destination:'./files/products',
         filename:fileNamer

      })
   }))
   uploadFile(@UploadedFile() file:Express.Multer.File){
      
      if(!file){
         throw new BadRequestException('Make sure that the file is an image');
      }

      const secureUrl=`${this.configservice.get('HOST_API')}/files/product/${file.filename}`;
      return { secureUrl};
   }
  

}
