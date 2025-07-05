import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/schemas/order.schema';
import { ProductsService } from '../products/products.service';

export interface IzipayPaymentData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identityType: string;
  identityCode: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  orderId: string;
  amount: number;
  currency: string;
  items: any[];
}

export interface IzipayFormTokenResponse {
  formToken: string;
  publicKey: string;
}

export interface IzipayValidationData {
  'kr-answer': string;
  'kr-hash': string;
}

@Injectable()
export class IzipayService {
  private readonly publicKey: string;
  private readonly user: string;
  private readonly password: string;
  private readonly endpoint: string;
  private readonly merchantId: string;
  private readonly environment: string;
  private readonly hmacKey: string;
  private orderItemsMap = new Map<string, any[]>(); // orderId -> items

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {
    this.publicKey = this.configService.get<string>('IZIPAY_PUBLIC_KEY'); // solo para frontend
    this.user = this.configService.get<string>('IZIPAY_USER');
    this.password = this.configService.get<string>('IZIPAY_PASSWORD');
    this.endpoint = this.configService.get<string>('IZIPAY_ENDPOINT');
    this.merchantId = this.configService.get<string>('IZIPAY_MERCHANT_ID');
    this.environment = this.configService.get<string>('IZIPAY_ENVIRONMENT');
    this.hmacKey = this.configService.get<string>('IZIPAY_HMAC_KEY');
  }

  async createFormToken(paymentData: IzipayPaymentData): Promise<IzipayFormTokenResponse> {
    // Forzar country a 'PE' y currency a 'PEN'
    const countryCode = 'PE';
    const currency = paymentData.currency && paymentData.currency.trim() ? paymentData.currency : 'PEN';
    const amount = Math.round(paymentData.amount * 100); // paymentData.amount debe ser el total (incluyendo envío)
    const formData = {
      amount: amount,
      currency: currency,
      orderId: paymentData.orderId,
      customer: {
        email: paymentData.email,
        reference: paymentData.identityCode,
        billingDetails: {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          phoneNumber: paymentData.phoneNumber,
          identityType: paymentData.identityType,
          identityCode: paymentData.identityCode,
          address: paymentData.address,
          country: countryCode,
          state: paymentData.state,
          city: paymentData.city,
          zipCode: paymentData.zipCode,
        },
        shippingDetails: {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          phoneNumber: paymentData.phoneNumber,
          address: paymentData.address,
          country: countryCode,
          state: paymentData.state,
          city: paymentData.city,
          zipCode: paymentData.zipCode,
        }
      },
      formAction: 'PAYMENT',
      paymentMethodToken: null,
      paymentOption: {
        card: {
          paymentMethod: 'CARD'
        }
      }
    };
    

    // Autenticación con usuario y contraseña (no clave pública)
    const auth = Buffer.from(`${this.user}:${this.password}`).toString('base64');

    const response = await fetch(`${this.endpoint}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.status !== 'SUCCESS') {
      throw new Error(`Izipay error: ${data.answer?.errorMessage || JSON.stringify(data) || 'Unknown error'}`);
    }

    // Guardar los items en memoria temporalmente
    if (paymentData.items && paymentData.orderId) {
      this.orderItemsMap.set(paymentData.orderId, paymentData.items);
    }

    return {
      formToken: data.answer.formToken,
      publicKey: this.publicKey, // para el frontend
    };
  }

  async validatePayment(validationData: IzipayValidationData): Promise<{ success: boolean, orderId?: string }> {
    const { 'kr-answer': krAnswer, 'kr-hash': krHash } = validationData;

    let decodedAnswer: any;
    let answerString: string;
    if (typeof krAnswer === 'string') {
      answerString = krAnswer;
      decodedAnswer = JSON.parse(Buffer.from(answerString, 'base64').toString());
    } else {
      decodedAnswer = krAnswer;
      answerString = JSON.stringify(krAnswer);
    }

    const expectedHash = CryptoJS.HmacSHA256(answerString, this.hmacKey).toString();
    if (krHash !== expectedHash) {
      throw new Error('Invalid hash signature');
    }
    const isPaid = decodedAnswer.orderStatus === 'PAID';
    let orderId: string | undefined = undefined;
    if (isPaid) {
      orderId = decodedAnswer.orderDetails?.orderId || decodedAnswer.orderId;
      // Recuperar los items guardados temporalmente
      const items = orderId ? this.orderItemsMap.get(orderId) || [] : [];
      // Eliminar del map para liberar memoria
      if (orderId) this.orderItemsMap.delete(orderId);
      const order: Partial<Order> = {
        orderId,
        user: {
          name: decodedAnswer.customer?.billingDetails?.firstName + ' ' + decodedAnswer.customer?.billingDetails?.lastName,
          email: decodedAnswer.customer?.email,
          phone: decodedAnswer.customer?.billingDetails?.phoneNumber,
        },
        shipping: {
          address: decodedAnswer.customer?.shippingDetails?.address,
          city: decodedAnswer.customer?.shippingDetails?.city,
          state: decodedAnswer.customer?.shippingDetails?.state,
          zipCode: decodedAnswer.customer?.shippingDetails?.zipCode,
          country: decodedAnswer.customer?.shippingDetails?.country,
          identityType: decodedAnswer.customer?.billingDetails?.identityType,
          identityCode: decodedAnswer.customer?.billingDetails?.identityCode,
        },
        items,
        total: decodedAnswer.orderDetails?.orderTotalAmount / 100 || 0,
        payment: {
          method: 'izipay',
          status: 'pagado',
        },
        status: 'confirmado',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await this.ordersService.create(order);
      // Descontar stock
      for (const item of items) {
        // item.product._id, item.size, item.color, item.quantity
        await this.productsService.decrementVariantStock(item.product._id, item.size, item.color, item.quantity);
      }
    }
    return { success: isPaid, orderId };
  }

  generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ORD-${timestamp.slice(-6)}${random}`;
  }

  /**
   * Devuelve la configuración de sesión para el widget de Izipay usando datos reales y el formToken real
   */
  async getSessionConfig(orderId: string, orderData: any) {
    // Llama a createFormToken para obtener el formToken real
    const paymentData = {
      orderId,
      amount: orderData?.amount || 1,
      currency: orderData?.currency || 'PEN',
      firstName: orderData?.firstName || '',
      lastName: orderData?.lastName || '',
      email: orderData?.email || '',
      phoneNumber: orderData?.phoneNumber || '',
      identityType: orderData?.identityType || 'DNI',
      identityCode: orderData?.identityCode || '',
      address: orderData?.address || '',
      country: orderData?.country || 'PE',
      state: orderData?.state || '',
      city: orderData?.city || '',
      zipCode: orderData?.zipCode || '',
      items: orderData?.items || [],
    };
    const { formToken, publicKey } = await this.createFormToken(paymentData);
    const merchantCode = this.merchantId || 'DEMO_MERCHANT';
    const now = new Date();
    const dateTimeTransaction = now.getTime().toString();
    const config = {
      transactionId: orderId,
      action: 'pay',
      merchantCode: merchantCode,
      order: {
        orderNumber: orderId,
        currency: orderData?.currency || 'PEN',
        amount: String(Math.round((orderData?.amount || 1) * 100)),
        processType: 'AT',
        merchantBuyerId: merchantCode,
        dateTimeTransaction: dateTimeTransaction,
      },
      billing: {
        firstName: orderData?.firstName || '',
        lastName: orderData?.lastName || '',
        email: orderData?.email || '',
        phoneNumber: orderData?.phoneNumber || '',
        street: orderData?.address || '',
        city: orderData?.city || '',
        state: orderData?.state || '',
        country: orderData?.country || 'PE',
        postalCode: orderData?.zipCode || '',
        documentType: orderData?.identityType || 'DNI',
        document: orderData?.identityCode || '',
      },
      container: 'iframe-payment',
    };
    return { token: formToken, keyRSA: publicKey, config };
  }
} 