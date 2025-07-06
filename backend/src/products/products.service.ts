import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const created = new this.productModel(createProductDto);
      return await created.save();
    } catch (err: any) {
      // Intercepta errores de validación de Mongoose
      if (err.name === 'ValidationError') {
        // Extrae mensajes claros de los campos requeridos
        const messages = Object.values(err.errors).map((e: any) => e.message || e);
        throw new BadRequestException(messages.length === 1 ? messages[0] : messages);
      }
      throw err;
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Producto no encontrado');
  }

  async decrementVariantStock(productId: string, size: string, color: string, quantity: number): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');
    const variant = product.variants.find((v: any) =>
      v.size.toLowerCase() === size.toLowerCase() &&
      v.color.toLowerCase() === color.toLowerCase()
    );
    if (!variant) {
      console.error(`Variante no encontrada para producto ${productId} - size: ${size}, color: ${color}`);
      throw new NotFoundException('Variante no encontrada');
    }
    if (variant.stock < quantity) {
      console.error(`Stock insuficiente para producto ${productId} - variante size: ${size}, color: ${color}`);
      throw new Error('Stock insuficiente');
    }
    variant.stock -= quantity;
    await product.save();
    
  }
} 