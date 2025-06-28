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

      const sampleProducts = [
        {
          nombre: "Polo Negro Estampado",
          descripcion: "Polo con diseño moderno y estampado.",
          precio: 59.90,
          precioAnterior: 79.90,
          descuento: 25,
          imagen: "/polo_negro.png",
          tallas: ["S", "M", "L"],
          categoria: "Hombre",
          tipo: "Polo",
          stock: 30,
          destacado: true,
          activo: true
        },
        {
          nombre: "Polo Deportivo Azul Mujer",
          descripcion: "Ideal para actividades deportivas.",
          precio: 54.90,
          precioAnterior: 74.90,
          descuento: 27,
          imagen: "/polo_azul_mujer.png",
          tallas: ["M", "L", "XL"],
          categoria: "Mujer",
          tipo: "Polo",
          stock: 25,
          destacado: true,
          activo: true
        },
        {
          nombre: "Polo Gris Básico",
          descripcion: "Polo gris básico para cualquier ocasión.",
          precio: 52.90,
          precioAnterior: 62.90,
          descuento: 16,
          imagen: "/polo_gris.png",
          tallas: ["S", "M", "L"],
          categoria: "Unisex",
          tipo: "Polo",
          stock: 40,
          destacado: false,
          activo: true
        },
        {
          nombre: "Polo Naranja Juvenil",
          descripcion: "Polo juvenil color naranja, tendencia actual.",
          precio: 44.90,
          precioAnterior: 54.90,
          descuento: 18,
          imagen: "/polo_naranja.png",
          tallas: ["XS", "S", "M"],
          categoria: "Mujer",
          tipo: "Polo",
          stock: 20,
          destacado: false,
          activo: true
        },
        {
          nombre: "Polo Infantil Rosado Mujer",
          descripcion: "Polo divertido y colorido para niñas.",
          precio: 39.90,
          precioAnterior: 49.90,
          descuento: 20,
          imagen: "/polo_rosado_de_mujer.png",
          tallas: ["4", "6", "8", "10"],
          categoria: "Infantil",
          tipo: "Polo",
          stock: 15,
          destacado: false,
          activo: true
        },
        {
          nombre: "Polo Rojo Unisex",
          descripcion: "Polo rojo vibrante para todos.",
          precio: 36.90,
          precioAnterior: 46.90,
          descuento: 21,
          imagen: "/polo_rojo.png",
          tallas: ["S", "M", "L", "XL"],
          categoria: "Unisex",
          tipo: "Polo",
          stock: 35,
          destacado: false,
          activo: true
        },
        {
          nombre: "Camisa Azul Botones",
          descripcion: "Camisa azul con botones, elegante y cómoda.",
          precio: 64.90,
          precioAnterior: 84.90,
          descuento: 24,
          imagen: "/camisa_azul_botones.png",
          tallas: ["S", "M", "L", "XL"],
          categoria: "Hombre",
          tipo: "Camisa",
          stock: 20,
          destacado: true,
          activo: true
        },
        {
          nombre: "Camisa Verde Casual",
          descripcion: "Camisa verde casual para uso diario.",
          precio: 42.90,
          precioAnterior: 52.90,
          descuento: 19,
          imagen: "/camisa_verde.png",
          tallas: ["S", "M", "L", "XL"],
          categoria: "Hombre",
          tipo: "Camisa",
          stock: 25,
          destacado: false,
          activo: true
        },
        {
          nombre: "Camisa Blanca Clásica",
          descripcion: "Camisa blanca clásica, imprescindible en tu armario.",
          precio: 45.90,
          precioAnterior: 59.90,
          descuento: 23,
          imagen: "/camisa_blanco.png",
          tallas: ["S", "M", "L", "XL"],
          categoria: "Hombre",
          tipo: "Camisa",
          stock: 30,
          destacado: true,
          activo: true
        }
      ];

      for (const product of sampleProducts) {
        await this.productsService.create(product);
      }

      console.log('✅ Productos de ejemplo creados exitosamente');
    } catch (error) {
      console.log('ℹ️ Error creando productos de ejemplo:', error.message);
    }
  }
} 