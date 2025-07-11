import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() order: Partial<Order>) {
    return this.ordersService.create(order);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':orderId')
  async findById(@Param('orderId') orderId: string) {
    return this.ordersService.findById(orderId);
  }

  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: string }
  ) {
    return this.ordersService.updateStatus(orderId, body.status);
  }

  @Get('user/:uid')
  async findByFirebaseUid(@Param('uid') uid: string) {
    return this.ordersService.findByFirebaseUid(uid);
  }


  // Endpoint para probar la plantilla de confirmación de compra
  @Post('test-whatsapp-template')
  async testWhatsAppTemplate(@Body() body: { phone: string; nombre: string; orderId: string }) {
    console.log('POST /orders/test-whatsapp-template', body);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Intento de uso en producción, bloqueado');
      return { error: 'Este endpoint solo está disponible en desarrollo' };
    }

    try {
      // Formatear el número de teléfono
      const formattedPhone = this.ordersService.formatPhoneNumber(body.phone);     
      
      await this.ordersService.sendOrderConfirmationTemplate(formattedPhone, body.nombre, body.orderId);
      
      return { 
        success: true, 
        message: 'Plantilla de confirmación enviada correctamente',
        data: {
          phone: formattedPhone,
          nombre: body.nombre,
          orderId: body.orderId
        }
      };
    } catch (error) {
      console.error('Error enviando plantilla de confirmación:', error);
      return { 
        error: error.message,
        details: {
          phone: body.phone,
          nombre: body.nombre,
          orderId: body.orderId
        }
      };
    }
  }
} 