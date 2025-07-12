import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async cleanupOrphanedImages(): Promise<any> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const deleted: string[] = [];
    const errors: string[] = [];

    try {
      // Obtener todas las imágenes en uso en la base de datos
      const products = await this.productModel.find().exec();
      const usedImages = new Set<string>();
      
      products.forEach(product => {
        if (product.images && product.images.length > 0) {
          product.images.forEach(image => {
            if (image.url && image.url.startsWith('/uploads/')) {
              usedImages.add(path.basename(image.url));
            }
          });
        }
      });

      // Obtener todos los archivos en el directorio de uploads
      const files = await fs.readdir(uploadsDir);
      
      // Eliminar archivos que no están en uso
      for (const file of files) {
        if (!usedImages.has(file)) {
          try {
            const filePath = path.join(uploadsDir, file);
            await fs.remove(filePath);
            deleted.push(file);
          } catch (error) {
            errors.push(`Error eliminando ${file}: ${error.message}`);
          }
        }
      }

      if (deleted.length === 0) {
        return { message: 'No hay archivos huérfanos que limpiar.' };
      }

      return { deleted, errors };
    } catch (error) {
      errors.push(`Error general: ${error.message}`);
      return { deleted, errors };
    }
  }

  async getUploadStats(): Promise<{ totalFiles: number, totalSize: number, usedFiles: number }> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      // Contar archivos en uso
      const products = await this.productModel.find().exec();
      const usedImages = new Set<string>();
      
      products.forEach(product => {
        if (product.images && product.images.length > 0) {
          product.images.forEach(image => {
            if (image.url && image.url.startsWith('/uploads/')) {
              usedImages.add(path.basename(image.url));
            }
          });
        }
      });

      return {
        totalFiles: files.length,
        totalSize,
        usedFiles: usedImages.size
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { totalFiles: 0, totalSize: 0, usedFiles: 0 };
    }
  }

  async deleteCloudinaryImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok' || result.result === 'not found') {
        return { message: 'Imagen eliminada de Cloudinary', result };
      } else {
        return { message: 'No se pudo eliminar la imagen', result };
      }
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error);
      throw new Error('Error al eliminar la imagen de Cloudinary');
    }
  }
} 