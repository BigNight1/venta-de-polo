import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';

class CreatePaymentIntentDto {
  amount: number;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body(new ValidationPipe()) { amount }: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(amount);
  }
} 