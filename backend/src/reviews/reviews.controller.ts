import { Controller, Get, Post, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './review.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews?productId=abc123
  @Get()
  async getByProduct(@Query('productId') productId: string): Promise<Review[]> {
    return this.reviewsService.findByProduct(productId);
  }

  // POST /reviews
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() review: Partial<Review>, @Req() req: Request): Promise<Review> {
    // Asigna el userId del token
    const user = req.user as any;
    if (user && user.userId) review.userId = user.userId;
    return this.reviewsService.create(review);
  }

  // PATCH /reviews/:id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() update: Partial<Review>, @Req() req: Request): Promise<Review> {
    const user = req.user as any;
    if (!user || !user.userId) throw new ForbiddenException('No autorizado');
    return this.reviewsService.update(id, update, user.userId);
  }

  // DELETE /reviews/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const user = req.user as any;
    if (!user || !user.userId) throw new ForbiddenException('No autorizado');
    return this.reviewsService.remove(id, user.userId);
  }
} 