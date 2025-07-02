import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async cleanupOrphanedImages(): Promise<any> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const deleted: string[] = [];
    const errors: string[] = [];

    try {
      // Obtener todas las imágenes en uso en la base de datos
      const products = await this.productModel.find().exec();
      const usedImages = new Set<string>();
      
      products.forEach(product => {
        if (product.images && product.images[0] && product.images[0].startsWith('/uploads/')) {
          usedImages.add(path.basename(product.images[0]));
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
            console.log(`Archivo huérfano eliminado: ${file}`);
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
        if (product.images && product.images[0] && product.images[0].startsWith('/uploads/')) {
          usedImages.add(path.basename(product.images[0]));
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
} 