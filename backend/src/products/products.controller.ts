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
        description: 'Polo de algodón suave y cómodo',
        price: 45,
        images: ['url1'],
        category: 'hombre',
        variants: [
          { size: 'S', color: 'Azul', stock: 5 },
          { size: 'M', color: 'Azul', stock: 3 },
          { size: 'L', color: 'Rojo', stock: 2 },
        ],
        inStock: true,
        featured: true,
        createdAt: '2024-01-15',
      },
      {
        name: 'Polo Deportivo Dri-Fit',
        description: 'Polo deportivo con tecnología que absorbe la humedad. Ideal para actividades físicas y deportes.',
        price: 39.99,
        images: ['https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg'],
        category: 'hombre',
        variants: [
          { size: 'S', color: 'Rojo', stock: 8 },
          { size: 'M', color: 'Azul', stock: 12 },
          { size: 'L', color: 'Verde', stock: 10 },
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