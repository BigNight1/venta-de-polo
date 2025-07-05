import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { IzipayService, IzipayPaymentData, IzipayValidationData } from './izipay.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly izipayService: IzipayService,
  ) {}

  // Izipay endpoints
  @Post('izipay/formtoken')
  async createIzipayFormToken(@Body() paymentData: IzipayPaymentData) {
    return this.izipayService.createFormToken(paymentData);
  }

  @Post('izipay/validate')
  async validateIzipayPayment(@Body() validationData: IzipayValidationData) {
    const result = await this.izipayService.validatePayment(validationData);
    return result;
  }

  @Get('izipay/order-id')
  async generateOrderId() {
    return { orderId: this.izipayService.generateOrderId() };
  }

  @Post('izipay/session')
  async getIzipaySession(@Body() body: any) {
    const { orderId, ...orderData } = body;
    const finalOrderId = orderId || this.izipayService.generateOrderId();
    const session = this.izipayService.getSessionConfig(finalOrderId, orderData);
    return session;
  }
} 