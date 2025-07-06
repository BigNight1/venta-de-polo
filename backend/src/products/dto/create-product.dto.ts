import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @IsString({ message: 'Falta la talla' })
  @IsNotEmpty({ message: 'Falta la talla' })
  size: string;

  @IsString({ message: 'Falta el color' })
  @IsNotEmpty({ message: 'Falta el color' })
  color: string;

  @IsNumber({}, { message: 'Falta el stock' })
  stock: number;
}

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'Falta rellenar el nombre' })
  name: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'Falta rellenar la descripción' })
  description: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  price: number;

  @IsArray({ message: 'Las imágenes deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada imagen debe ser una URL de texto' })
  @IsNotEmpty({ each: true, message: 'Falta agregar al menos una imagen' })
  images: string[];

  @IsString({ message: 'La categoría debe ser un texto' })
  @IsNotEmpty({ message: 'Falta seleccionar la categoría' })
  category: string;

  @IsArray({ message: 'Debes agregar al menos una variante (talla, color, stock)' })
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];

  @IsBoolean()
  inStock: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsString()
  @IsOptional()
  createdAt?: string;
} 