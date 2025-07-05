import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
    await this.seedSampleProducts();
  }

  private async seedAdminUser() {
    try {
      await this.usersService.createAdminUser();
      console.log('✅ Usuario admin creado exitosamente');
    } catch (error) {
      console.log('ℹ️ Usuario admin ya existe o error:', error.message);
    }
  }

  private async seedSampleProducts() {
    try {
      const existingProducts = await this.productsService.findAll();
      if (existingProducts.length > 0) {
        console.log('ℹ️ Productos ya existen, saltando seed');
        return;
      }

      const products = [
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
          name: 'Polo Deportivo Azul Mujer',
          description: 'Ideal para actividades deportivas.',
          price: 54.90,
          images: ['/uploads/polo_azul_mujer.png'],
          category: 'mujer',
          variants: [
            { size: 'M', color: 'Azul', stock: 25 },
            { size: 'L', color: 'Azul', stock: 20 },
            { size: 'XL', color: 'Azul', stock: 15 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Gris Básico',
          description: 'Polo gris básico para cualquier ocasión.',
          price: 52.90,
          images: ['/uploads/polo_gris.png'],
          category: 'unisex',
          variants: [
            { size: 'S', color: 'Gris', stock: 40 },
            { size: 'M', color: 'Gris', stock: 40 },
            { size: 'L', color: 'Gris', stock: 40 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Naranja Juvenil',
          description: 'Polo juvenil color naranja, tendencia actual.',
          price: 44.90,
          images: ['/uploads/polo_naranja.png'],
          category: 'mujer',
          variants: [
            { size: 'XS', color: 'Naranja', stock: 20 },
            { size: 'S', color: 'Naranja', stock: 20 },
            { size: 'M', color: 'Naranja', stock: 20 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Infantil Rosado Mujer',
          description: 'Polo divertido y colorido para niñas.',
          price: 39.90,
          images: ['/uploads/polo_rosado_de_mujer.png'],
          category: 'infantil',
          variants: [
            { size: '4', color: 'Rosado', stock: 15 },
            { size: '6', color: 'Rosado', stock: 15 },
            { size: '8', color: 'Rosado', stock: 15 },
            { size: '10', color: 'Rosado', stock: 15 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Rojo Unisex',
          description: 'Polo rojo vibrante para todos.',
          price: 36.90,
          images: ['/uploads/polo_rojo.png'],
          category: 'unisex',
          variants: [
            { size: 'S', color: 'Rojo', stock: 35 },
            { size: 'M', color: 'Rojo', stock: 35 },
            { size: 'L', color: 'Rojo', stock: 35 },
            { size: 'XL', color: 'Rojo', stock: 35 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Azul Botones',
          description: 'Camisa azul con botones, elegante y cómoda.',
          price: 64.90,
          images: ['/uploads/camisa_azul_botones.png'],
          category: 'hombre',
          variants: [
            { size: 'S', color: 'Azul', stock: 20 },
            { size: 'M', color: 'Azul', stock: 20 },
            { size: 'L', color: 'Azul', stock: 20 },
            { size: 'XL', color: 'Azul', stock: 20 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Verde Casual',
          description: 'Camisa verde casual para uso diario.',
          price: 42.90,
          images: ['/uploads/camisa_verde.png'],
          category: 'hombre',
          variants: [
            { size: 'S', color: 'Verde', stock: 25 },
            { size: 'M', color: 'Verde', stock: 25 },
            { size: 'L', color: 'Verde', stock: 25 },
            { size: 'XL', color: 'Verde', stock: 25 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Blanca Clásica',
          description: 'Camisa blanca clásica, imprescindible en tu armario.',
          price: 45.90,
          images: ['/uploads/camisa_blanco.png'],
          category: 'hombre',
          variants: [
            { size: 'S', color: 'Blanco', stock: 30 },
            { size: 'M', color: 'Blanco', stock: 30 },
            { size: 'L', color: 'Blanco', stock: 30 },
            { size: 'XL', color: 'Blanco', stock: 30 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        }
      ];

      for (const product of products) {
        await this.productsService.create(product);
      }

      console.log('✅ Productos de ejemplo creados exitosamente');
    } catch (error) {
      console.log('ℹ️ Error creando productos de ejemplo:', error.message);
    }
  }
} 