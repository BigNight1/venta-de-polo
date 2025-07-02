import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Size {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  stock: number;
}

@Schema()
export class Color {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  hex: string;
  @Prop({ required: true })
  stock: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ required: true })
  category: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  sizes: Size[];

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  colors: Color[];

  @Prop({ required: true })
  inStock: boolean;

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  createdAt?: string;
}

export const SizeSchema = SchemaFactory.createForClass(Size);
export const ColorSchema = SchemaFactory.createForClass(Color);
export const ProductSchema = SchemaFactory.createForClass(Product);

// Transformar _id a id cuando se serializa a JSON
ProductSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
}); 