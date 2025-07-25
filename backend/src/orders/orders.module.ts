import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { ProductsModule } from '../products/products.module';
import { ProductsService } from '../products/products.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), ProductsModule, UploadModule],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsService],
  exports: [OrdersService],
})
export class OrdersModule {} 