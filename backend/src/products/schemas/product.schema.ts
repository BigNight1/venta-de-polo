import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  precio: number;

  @Prop()
  precioAnterior?: number;

  @Prop()
  descuento?: number;

  @Prop({ required: true })
  categoria: string; // Hombre, Mujer, Infantil, Unisex

  @Prop({ required: true })
  tipo: string; // Polo, Camisa, Polera, etc.

  @Prop({ type: [String], required: true })
  tallas: string[];

  @Prop({ required: true })
  imagen: string; // url o path

  @Prop()
  stock?: number;

  @Prop({ default: false })
  destacado?: boolean;

  @Prop({ default: true })
  activo?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product); 