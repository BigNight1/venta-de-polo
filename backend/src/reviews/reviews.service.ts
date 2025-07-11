import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(review: Partial<Review>): Promise<Review> {
    const created = new this.reviewModel(review);
    return created.save();
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, update: Partial<Review>, userId: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.userId !== userId) throw new ForbiddenException('No autorizado');
    if (update.comment !== undefined) review.comment = update.comment;
    if (update.rating !== undefined) review.rating = update.rating;
    await review.save();
    return review;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.userId !== userId) throw new ForbiddenException('No autorizado');
    await this.reviewModel.findByIdAndDelete(id).exec();
  }
} 