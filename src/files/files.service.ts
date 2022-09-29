import { Injectable, Patch, BadRequestException } from '@nestjs/common';

import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {
  
    getStaticProductImage(imageName:string){

        const path=join(__dirname,'../../files/products',imageName);
        console.log(path);
        console.log(existsSync(path));
        if(!existsSync(path)){
            throw new BadRequestException(`No product found with image ${imageName}`)
        }

        return path;

    }
}
