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

    // Enviar plantilla de confirmación de compra (WhatsApp template)
    try {
      if (savedOrder.user?.phone && savedOrder.user?.name && savedOrder.orderId) {
        console.log('[WHATSAPP] Enviando plantilla de confirmación con:', {
          phone: savedOrder.user.phone,
          nombre: savedOrder.user.name,
          orderId: savedOrder.orderId
        });
        await this.sendOrderConfirmationTemplate(
          this.formatPhoneNumber(savedOrder.user.phone),
          savedOrder.user.name,
          savedOrder.orderId
        );
      } else {
        console.log('[WHATSAPP] Faltan datos para enviar plantilla:', {
          phone: savedOrder.user?.phone,
          nombre: savedOrder.user?.name,
          orderId: savedOrder.orderId
        });
      }
    } catch (err) {
      console.error('[WHATSAPP] Error enviando plantilla de confirmación:', err);
    }
    
    return savedOrder;
  }

  
  formatPhoneNumber(phone: string): string {
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

  async sendOrderConfirmationTemplate(phoneNumber: string, nombre: string, orderId: string) {
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'compra_exitosa', // Usa el nombre exacto de tu plantilla
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: nombre }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                { type: 'text', text: orderId }
              ]
            }
          ]
        }
      })
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[WhatsAppAPI] Error al enviar plantilla:', errorBody);
      throw new Error(`WhatsApp API error: ${response.statusText} - ${errorBody}`);
    } else {
      const successBody = await response.text();
      console.log('[WhatsAppAPI] Plantilla enviada correctamente. Respuesta:', successBody);
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
      // await this.sendStatusUpdateNotification(updatedOrder, status); // Removed as per edit hint
    }

    return updatedOrder;
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