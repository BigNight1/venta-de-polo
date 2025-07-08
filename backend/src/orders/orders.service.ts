import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async create(order: Partial<Order>) {
    // Calcular subtotal
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
      subtotal = order.items.reduce((sum, item) => {
        // Si el item ya trae el precio, úsalo; si no, busca el producto
        if (item.unitPrice) {
          return sum + (item.unitPrice * (item.quantity || 1));
        } else if (item.product && item.product.price) {
          return sum + (item.product.price * (item.quantity || 1));
        }
        return sum;
      }, 0);
    }
    // Costo de envío: usa el que viene o por defecto 10
    const shippingCost = typeof order.shippingCost === 'number' ? order.shippingCost : 10;
    // Total
    const total = subtotal + shippingCost;
    // Asignar a la orden
    order.subtotal = subtotal;
    order.shippingCost = shippingCost;
    order.total = total;
    const created = new this.orderModel(order);
    const savedOrder = await created.save();
    
    // Enviar notificación de WhatsApp
    await this.sendWhatsAppNotification(savedOrder);
    
    return savedOrder;
  }

  private async sendWhatsAppNotification(order: Order) {
    try {
      const phoneNumber = order.user?.phone;
      if (!phoneNumber) {
        console.log('No se encontró número de teléfono para enviar WhatsApp');
        return;
      }

      // Formatear el número de teléfono (asumiendo formato peruano)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Crear mensaje
      const message = this.createOrderMessage(order);
      
      // Enviar WhatsApp usando la API de WhatsApp Business
      await this.sendWhatsAppMessage(formattedPhone, message);
      
      console.log(`WhatsApp enviado a ${formattedPhone} para orden ${order.orderId}`);
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remover espacios, guiones y paréntesis
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si empieza con 0, removerlo
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Si empieza con +51, removerlo
    if (cleaned.startsWith('+51')) {
      cleaned = cleaned.substring(3);
    }
    
    // Si empieza con 51, removerlo
    if (cleaned.startsWith('51')) {
      cleaned = cleaned.substring(2);
    }
    
    // Agregar código de país si no lo tiene
    if (!cleaned.startsWith('51')) {
      cleaned = '51' + cleaned;
    }
    
    return cleaned;
  }

  private createOrderMessage(order: Order): string {
    const items = order.items?.map(item => {
      const productName = item.product?.name || 'Producto';
      const quantity = item.quantity || 1;
      const price = item.unitPrice || item.product?.price || 0;
      return `• ${productName} x${quantity} - S/ ${price.toFixed(2)}`;
    }).join('\n') || '';

    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-PE') : new Date().toLocaleDateString('es-PE');

    return `🛍️ *¡Gracias por tu compra!*

📦 *Pedido #${order.orderId}*

${items}

💰 *Resumen:*
Subtotal: S/ ${order.subtotal?.toFixed(2)}
Envío: S/ ${order.shippingCost?.toFixed(2)}
*Total: S/ ${order.total?.toFixed(2)}*

📋 *Estado:* ${this.getStatusEmoji(order.status)} ${order.status}

📅 *Fecha:* ${orderDate}

🚚 *Entrega estimada:* ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('es-PE') : 'Por confirmar'}

¡Te mantendremos informado sobre el estado de tu pedido!`;
  }

  private getStatusEmoji(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'shipped': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return statusMap[status] || '📋';
  }

  private async sendWhatsAppMessage(phoneNumber: string, message: string) {
    // Aquí implementaremos la lógica de envío de WhatsApp
    // Por ahora, solo simulamos el envío
    
    // Opción 1: WhatsApp Business API (recomendada)
    if (process.env.WHATSAPP_BUSINESS_TOKEN) {
      await this.sendViaWhatsAppBusinessAPI(phoneNumber, message);
    }
    
    // Opción 3: Simulación para desarrollo
    else {
      console.log('🔔 SIMULACIÓN - WhatsApp enviado:');
      console.log(`📱 A: ${phoneNumber}`);
      console.log(`💬 Mensaje: ${message}`);
    }
  }

  private async sendViaWhatsAppBusinessAPI(phoneNumber: string, message: string) {
    // Implementación con WhatsApp Business API
    console.log('[WhatsAppAPI] Enviando mensaje a:', phoneNumber);
    console.log('[WhatsAppAPI] Mensaje:', message);
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    console.log('[WhatsAppAPI] URL:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[WhatsAppAPI] Error status:', response.status, response.statusText);
      console.error('[WhatsAppAPI] Error body:', errorBody);
      throw new Error(`WhatsApp API error: ${response.statusText} - ${errorBody}`);
    } else {
      const successBody = await response.text();
      console.log('[WhatsAppAPI] Mensaje enviado correctamente. Respuesta:', successBody);
    }
  }

  private async sendViaTwilio(phoneNumber: string, message: string) {
    // Implementación con Twilio WhatsApp API
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:+${phoneNumber}`,
        Body: message
      })
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).exec();
    return Promise.all(orders.map(async (order: any) => {
      order.items = await Promise.all((order.items || []).map(async (item: any) => {
        if (item.productId) {
          try {
            const product = await this.productsService.findOne(item.productId);
            return { ...item, product };
          } catch {
            return { ...item, product: null };
          }
        }
        return item;
      }));
      return order;
    }));
  }

  async findById(orderId: string): Promise<Order | null> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) return null;
    order.items = await Promise.all((order.items || []).map(async (item: any) => {
      if (item.productId) {
        try {
          const product = await this.productsService.findOne(item.productId);
          return { ...item, product };
        } catch {
          return { ...item, product: null };
        }
      }
      return item;
    }));
    return order;
  }

  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (updatedOrder) {
      // Enviar notificación de cambio de estado
      await this.sendStatusUpdateNotification(updatedOrder, status);
    }

    return updatedOrder;
  }

  private async sendStatusUpdateNotification(order: Order, newStatus: string) {
    try {
      const phoneNumber = order.user?.phone;
      if (!phoneNumber) {
        console.log('No se encontró número de teléfono para enviar notificación de estado');
        return;
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const message = this.createStatusUpdateMessage(order, newStatus);
      
      await this.sendWhatsAppMessage(formattedPhone, message);
      
      console.log(`Notificación de estado enviada a ${formattedPhone} para orden ${order.orderId}`);
    } catch (error) {
      console.error('Error enviando notificación de estado:', error);
    }
  }

  private createStatusUpdateMessage(order: Order, newStatus: string): string {
    const statusMessages: Record<string, string> = {
      'confirmed': `✅ *¡Tu pedido ha sido confirmado!*

📦 Pedido #${order.orderId}

Hemos recibido tu pago y estamos preparando tu pedido.

📅 *Fecha estimada de envío:* ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('es-PE') : 'Por confirmar'}

¡Te notificaremos cuando esté listo para enviar!`,

      'preparing': `👨‍🍳 *¡Tu pedido está siendo preparado!*

📦 Pedido #${order.orderId}

Nuestro equipo está seleccionando y empaquetando tus productos con cuidado.

📅 *Envío estimado:* ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('es-PE') : 'Por confirmar'}

¡Casi listo para salir!`,

      'shipped': `🚚 *¡Tu pedido está en camino!*

📦 Pedido #${order.orderId}

¡Tu pedido ya salió de nuestro almacén y está en ruta hacia ti!

📅 *Entrega estimada:* ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('es-PE') : 'Por confirmar'}

Te contactaremos cuando estemos cerca para coordinar la entrega.`,

      'delivered': `🎉 *¡Tu pedido ha sido entregado!*

📦 Pedido #${order.orderId}

¡Esperamos que disfrutes tus productos!

💝 *¡Gracias por elegirnos!*

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.`,

      'cancelled': `❌ *Tu pedido ha sido cancelado*

📦 Pedido #${order.orderId}

Lamentamos informarte que tu pedido ha sido cancelado.

Si tienes alguna pregunta, por favor contáctanos.

¡Esperamos verte pronto!`
    };

    return statusMessages[newStatus] || `📋 *Estado actualizado*

📦 Pedido #${order.orderId}

Estado: ${this.getStatusEmoji(newStatus)} ${newStatus}

¡Te mantendremos informado!`;
  }

  async findByFirebaseUid(uid: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ 'firebaseUser.uid': uid }).sort({ createdAt: -1 }).exec();
    return Promise.all(orders.map(async (order: any) => {
      order.items = await Promise.all((order.items || []).map(async (item: any) => {
        if (item.productId) {
          try {
            const product = await this.productsService.findOne(item.productId);
            return { ...item, product };
          } catch {
            return { ...item, product: null };
          }
        }
        return item;
      }));
      return order;
    }));
  }
} 