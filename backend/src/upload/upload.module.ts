import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {} 