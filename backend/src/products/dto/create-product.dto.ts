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

class ProductImageDto {
  @IsString({ message: 'La URL de la imagen debe ser un texto' })
  @IsNotEmpty({ message: 'Falta la URL de la imagen' })
  url: string;

  @IsString({ message: 'El public_id de la imagen debe ser un texto' })
  @IsNotEmpty({ message: 'Falta el public_id de la imagen' })
  public_id: string;
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
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

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
  material?: string;

  @IsString()
  @IsOptional()
  cuidado?: string;

  @IsString()
  @IsOptional()
  origen?: string;

  @IsString()
  @IsOptional()
  estilo?: string;

  @IsString()
  @IsOptional()
  createdAt?: string;
} 