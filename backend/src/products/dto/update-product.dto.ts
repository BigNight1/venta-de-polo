import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
 
export class UpdateProductDto extends PartialType(CreateProductDto) {
  variants?: { size: string; color: string; stock: number }[];
} 