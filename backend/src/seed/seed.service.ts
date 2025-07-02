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
          description: 'Polo de alta calidad en algodón 100% con corte clásico. Perfecto para uso diario con máximo confort.',
          price: 29.99,
          images: [
            '/uploads/polo_negro.png',
            '/uploads/polo_negro_2.png',
          ],
          category: 'hombre',
          sizes: [
            { id: 's', name: 'S', stock: 10 },
            { id: 'm', name: 'M', stock: 15 },
            { id: 'l', name: 'L', stock: 12 },
          ],
          colors: [
            { id: 'black', name: 'Negro', hex: '#000000', stock: 20 },
            { id: 'white', name: 'Blanco', hex: '#FFFFFF', stock: 18 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Deportivo Azul Mujer',
          description: 'Ideal para actividades deportivas.',
          price: 54.90,
          images: [
            '/uploads/polo_azul_mujer.png',
          ],
          category: 'mujer',
          sizes: [
            { id: 'm', name: 'M', stock: 25 },
            { id: 'l', name: 'L', stock: 20 },
            { id: 'xl', name: 'XL', stock: 15 },
          ],
          colors: [
            { id: 'blue', name: 'Azul', hex: '#0000FF', stock: 25 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Gris Básico',
          description: 'Polo gris básico para cualquier ocasión.',
          price: 52.90,
          images: [
            '/uploads/polo_gris.png',
          ],
          category: 'unisex',
          sizes: [
            { id: 's', name: 'S', stock: 40 },
            { id: 'm', name: 'M', stock: 40 },
            { id: 'l', name: 'L', stock: 40 },
          ],
          colors: [
            { id: 'gray', name: 'Gris', hex: '#808080', stock: 40 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Naranja Juvenil',
          description: 'Polo juvenil color naranja, tendencia actual.',
          price: 44.90,
          images: [
            '/uploads/polo_naranja.png',
          ],
          category: 'mujer',
          sizes: [
            { id: 'xs', name: 'XS', stock: 20 },
            { id: 's', name: 'S', stock: 20 },
            { id: 'm', name: 'M', stock: 20 },
          ],
          colors: [
            { id: 'orange', name: 'Naranja', hex: '#FFA500', stock: 20 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Infantil Rosado Mujer',
          description: 'Polo divertido y colorido para niñas.',
          price: 39.90,
          images: [
            '/uploads/polo_rosado_de_mujer.png',
          ],
          category: 'infantil',
          sizes: [
            { id: '4', name: '4', stock: 15 },
            { id: '6', name: '6', stock: 15 },
            { id: '8', name: '8', stock: 15 },
            { id: '10', name: '10', stock: 15 },
          ],
          colors: [
            { id: 'pink', name: 'Rosado', hex: '#FFC0CB', stock: 15 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Polo Rojo Unisex',
          description: 'Polo rojo vibrante para todos.',
          price: 36.90,
          images: [
            '/uploads/polo_rojo.png',
          ],
          category: 'unisex',
          sizes: [
            { id: 's', name: 'S', stock: 35 },
            { id: 'm', name: 'M', stock: 35 },
            { id: 'l', name: 'L', stock: 35 },
            { id: 'xl', name: 'XL', stock: 35 },
          ],
          colors: [
            { id: 'red', name: 'Rojo', hex: '#FF0000', stock: 35 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Azul Botones',
          description: 'Camisa azul con botones, elegante y cómoda.',
          price: 64.90,
          images: [
            '/uploads/camisa_azul_botones.png',
          ],
          category: 'hombre',
          sizes: [
            { id: 's', name: 'S', stock: 20 },
            { id: 'm', name: 'M', stock: 20 },
            { id: 'l', name: 'L', stock: 20 },
            { id: 'xl', name: 'XL', stock: 20 },
          ],
          colors: [
            { id: 'blue', name: 'Azul', hex: '#0000FF', stock: 20 },
          ],
          inStock: true,
          featured: true,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Verde Casual',
          description: 'Camisa verde casual para uso diario.',
          price: 42.90,
          images: [
            '/uploads/camisa_verde.png',
          ],
          category: 'hombre',
          sizes: [
            { id: 's', name: 'S', stock: 25 },
            { id: 'm', name: 'M', stock: 25 },
            { id: 'l', name: 'L', stock: 25 },
            { id: 'xl', name: 'XL', stock: 25 },
          ],
          colors: [
            { id: 'green', name: 'Verde', hex: '#00FF00', stock: 25 },
          ],
          inStock: true,
          featured: false,
          createdAt: '2024-01-15',
        },
        {
          name: 'Camisa Blanca Clásica',
          description: 'Camisa blanca clásica, imprescindible en tu armario.',
          price: 45.90,
          images: [
            '/uploads/camisa_blanco.png',
          ],
          category: 'hombre',
          sizes: [
            { id: 's', name: 'S', stock: 30 },
            { id: 'm', name: 'M', stock: 30 },
            { id: 'l', name: 'L', stock: 30 },
            { id: 'xl', name: 'XL', stock: 30 },
          ],
          colors: [
            { id: 'white', name: 'Blanco', hex: '#FFFFFF', stock: 30 },
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