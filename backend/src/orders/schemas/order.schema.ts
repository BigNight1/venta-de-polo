import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({
    type: {
      name: String,
      email: String,
      phone: String,
    },
    required: true,
  })
  user: {
    name: string;
    email: string;
    phone: string;
  };

  @Prop({
    type: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      identityType: String,
      identityCode: String,
    },
    required: true,
  })
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    identityType: string;
    identityCode: string;
  };

  @Prop({ type: Array, required: true })
  items: any[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  shippingCost: number;

  @Prop({
    type: {
      method: String,
      status: String,
    },
    required: true,
  })
  payment: {
    method: string;
    status: string;
  };

  @Prop({ required: true })
  status: string;

  @Prop()
  estimatedDelivery: string;

  @Prop()
  trackingNumber?: string;

  @Prop({
    type: {
      uid: String,
      email: String,
      displayName: String,
    },
    required: false,
  })
  firebaseUser?: {
    uid: string;
    email: string;
    displayName: string;
  };

  // Timestamps automáticos (createdAt, updatedAt)
  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 