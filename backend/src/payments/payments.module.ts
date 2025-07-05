import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { IzipayService } from './izipay.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ConfigModule, OrdersModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, IzipayService],
  exports: [PaymentsService, IzipayService],
})
export class PaymentsModule {} 