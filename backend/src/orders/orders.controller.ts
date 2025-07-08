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

  // Endpoint para probar WhatsApp (solo en desarrollo)
  @Post('test-whatsapp')
  async testWhatsApp(@Body() body: { phone: string; message?: string }) {
    console.log('POST /orders/test-whatsapp', body);
    if (process.env.NODE_ENV === 'production') {
      console.log('Intento de uso en producción, bloqueado');
      return { error: 'Este endpoint solo está disponible en desarrollo' };
    }

    const testMessage = body.message || `🧪 *Mensaje de prueba*

Este es un mensaje de prueba para verificar que WhatsApp está funcionando correctamente.

📱 Número: ${body.phone}
⏰ Fecha: ${new Date().toLocaleString('es-PE')}

¡Si recibes este mensaje, la configuración está correcta!`;

    try {
      console.log('Llamando a sendWhatsAppMessage con:', body.phone, testMessage);
      // Usar el método privado a través de una función pública temporal
      await (this.ordersService as any).sendWhatsAppMessage(body.phone, testMessage);
      console.log('sendWhatsAppMessage ejecutado correctamente');
      return { success: true, message: 'Mensaje de prueba enviado' };
    } catch (error) {
      console.error('Error en testWhatsApp:', error);
      return { error: error.message };
    }
  }
} 