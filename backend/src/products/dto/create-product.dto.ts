import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  precio: number;

  @IsNumber()
  @IsOptional()
  precioAnterior?: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsArray()
  @IsString({ each: true })
  tallas: string[];

  @IsString()
  @IsNotEmpty()
  imagen: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  destacado?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
} 