import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() order: Partial<Order>) {
    return this.ordersService.create(order);
  }

  @Get()
  async getAllOrders() {
    return this.ordersService.findAll();
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.ordersService.findById(orderId);
    if (!order) {
      return { error: 'Order not found' };
    }
    return order;
  }

  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: string }
  ) {
    const order = await this.ordersService.updateStatus(orderId, body.status);
    if (!order) {
      return { error: 'Order not found' };
    }
    return order;
  }
} 