import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ 
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ]
    }).exec();

    if (existingUser) {
      throw new ConflictException('Usuario o email ya existe');
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOne(identifier: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    }).exec();
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async createAdminUser(): Promise<User> {
    const adminData = {
      username: 'admin',
      password: "admin123",
      email: 'admin@polos.com',
      role: 'admin',
      firstName: 'Administrador',
      lastName: 'Sistema'
    };

    // Verificar si ya existe el admin
    const existingAdmin = await this.findOne(adminData.username);
    if (existingAdmin) {
      return existingAdmin;
    }
    return this.create(adminData);
  }
} 