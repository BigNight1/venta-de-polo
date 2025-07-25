import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Variant {
  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  stock: number;
}

@Schema({ _id: false })
export class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  public_id: string;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [ProductImage], required: true })
  images: ProductImage[];

  @Prop({ required: true })
  category: string;

  @Prop({ type: [Variant], required: true })
  variants: Variant[];

  @Prop({ required: true })
  inStock: boolean;

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  material?: string;

  @Prop()
  cuidado?: string;

  @Prop()
  origen?: string;

  @Prop()
  estilo?: string;

  @Prop()
  createdAt?: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
export const ProductSchema = SchemaFactory.createForClass(Product);

// Transformar _id a id cuando se serializa a JSON
ProductSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
}); 