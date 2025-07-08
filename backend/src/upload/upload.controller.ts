import { Controller, Post, Delete, Get, UseInterceptors, UploadedFile, UseGuards, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import * as fs from 'fs-extra';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filePath: `/uploads/${file.filename}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        return { message: 'Archivo eliminado correctamente' };
      } else {
        return { message: 'Archivo no encontrado' };
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('cleanup')
  async cleanupOrphanedImages() {
    return this.uploadService.cleanupOrphanedImages();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getUploadStats() {
    return this.uploadService.getUploadStats();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cloudinary/:publicId(*)')
  async deleteCloudinaryImage(@Param('publicId') publicId: string) {
    return this.uploadService.deleteCloudinaryImage(publicId);
  }
} 