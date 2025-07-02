import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Endpoint para insertar productos de ejemplo
  @Post('seed')
  async seedProducts() {
    const exampleProducts: CreateProductDto[] = [
      {
        name: 'Polo Clásico Algodón',
        description: 'Polo de alta calidad en algodón 100% con corte clásico. Perfecto para uso diario con máximo confort.',
        price: 29.99,
        images: [
          'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg',
          'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
        ],
        category: 'hombre',
        sizes: [
          { id: 's', name: 'S', stock: 10 },
          { id: 'm', name: 'M', stock: 15 },
          { id: 'l', name: 'L', stock: 12 },
          { id: 'xl', name: 'XL', stock: 8 },
        ],
        colors: [
          { id: 'white', name: 'Blanco', hex: '#FFFFFF', stock: 20 },
          { id: 'black', name: 'Negro', hex: '#000000', stock: 18 },
          { id: 'navy', name: 'Azul Marino', hex: '#1E3A8A', stock: 15 },
        ],
        inStock: true,
        featured: true,
        createdAt: '2024-01-15',
      },
      {
        name: 'Polo Deportivo Dri-Fit',
        description: 'Polo deportivo con tecnología que absorbe la humedad. Ideal para actividades físicas y deportes.',
        price: 39.99,
        images: [
          'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg',
          'https://images.pexels.com/photos/8532609/pexels-photo-8532609.jpeg',
        ],
        category: 'hombre',
        sizes: [
          { id: 's', name: 'S', stock: 8 },
          { id: 'm', name: 'M', stock: 12 },
          { id: 'l', name: 'L', stock: 10 },
          { id: 'xl', name: 'XL', stock: 6 },
        ],
        colors: [
          { id: 'red', name: 'Rojo', hex: '#DC2626', stock: 12 },
          { id: 'blue', name: 'Azul', hex: '#2563EB', stock: 14 },
          { id: 'green', name: 'Verde', hex: '#16A34A', stock: 10 },
        ],
        inStock: true,
        featured: false,
        createdAt: '2024-01-20',
      },
    ];
    const results = [];
    for (const product of exampleProducts) {
      results.push(await this.productsService.create(product));
    }
    return results;
  }
} 