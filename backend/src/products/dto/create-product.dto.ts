import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

class SizeDto {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsNumber()
  stock: number;
}

class ColorDto {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  hex: string;
  @IsNumber()
  stock: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  sizes: SizeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorDto)
  colors: ColorDto[];

  @IsBoolean()
  inStock: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsString()
  @IsOptional()
  createdAt?: string;
} 