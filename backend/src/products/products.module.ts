import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema, VariantSchema } from './schemas/product.schema';
import { UploadModule } from '../upload/upload.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { Review, ReviewSchema } from '../reviews/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: 'Variant', schema: VariantSchema },
      { name: Review.name, schema: ReviewSchema }, // <-- necesario para inyección
    ]),
    UploadModule,
    ReviewsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {} 