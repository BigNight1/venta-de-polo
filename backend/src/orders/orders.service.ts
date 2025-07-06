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
    return created.save();
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
    return this.orderModel.findOneAndUpdate(
      { orderId },
      { status, updatedAt: new Date() },
      { new: true }
    );
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