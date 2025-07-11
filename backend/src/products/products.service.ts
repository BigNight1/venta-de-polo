import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadService } from '../upload/upload.service';
import { Review, ReviewDocument } from '../reviews/review.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private uploadService: UploadService,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
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

  async findAll(): Promise<any[]> {
    // Solo productos con al menos una variante con stock > 0
    const products = await this.productModel.find({
      variants: { $elemMatch: { stock: { $gt: 0 } } }
    }).lean().exec();

    // Obtener los IDs de los productos
    const productIds = products.map(p => p._id.toString());

    // Obtener las reseñas agrupadas por producto
    const reviews = await this.reviewModel.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }}
    ]);
    const reviewMap = new Map(reviews.map(r => [r._id, r]));

    // Añadir los campos a cada producto
    return products.map(p => ({
      ...p,
      averageRating: reviewMap.get(p._id.toString())?.averageRating || 0,
      reviewCount: reviewMap.get(p._id.toString())?.reviewCount || 0,
    }));
  }

  async findAllAdmin(): Promise<Product[]> {
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
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    // Borrar imágenes de Cloudinary si tienen public_id
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await this.uploadService.deleteCloudinaryImage(image.public_id);
          } catch (e) {
            console.error('Error eliminando imagen de Cloudinary:', image.public_id, e);
          }
        }
      }
    }
    await this.productModel.findByIdAndDelete(id).exec();
  }

  async decrementVariantStock(productId: string, size: string, color: string, quantity: number): Promise<void> {
    // Usar arrayFilters para actualizar la variante exacta
    const result = await this.productModel.findOneAndUpdate(
      { _id: productId },
      {
        $inc: {
          'variants.$[elem].stock': -quantity
        }
      },
      {
        new: true,
        arrayFilters: [
          { 'elem.size': new RegExp(`^${size}$`, 'i'), 'elem.color': new RegExp(`^${color}$`, 'i'), 'elem.stock': { $gte: quantity } }
        ]
      }
    );

    if (!result) {
      // Si no se pudo actualizar, verificar qué pasó
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
      
      const variant = product.variants.find((v: any) =>
        v.size.toLowerCase() === size.toLowerCase() &&
        v.color.toLowerCase() === color.toLowerCase()
      );
      
      if (!variant) {
        throw new NotFoundException('Variante no encontrada');
      }
      
      if (variant.stock < quantity) {
        throw new Error(`Stock insuficiente - Disponible: ${variant.stock}, Solicitado: ${quantity}`);
      }
    }
  }
} 