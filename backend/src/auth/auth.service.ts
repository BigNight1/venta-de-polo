import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(identifier);
    if (!user) {
      console.log('Usuario no encontrado');
    } else {
      const match = await bcrypt.compare(pass, user.password);
    }
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const u = user._doc ? user._doc : user;
    const payload = {
      username: u.username,
      sub: u._id,
      role: u.role,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName
      }
    };
  }

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user as any;
    return result;
  }
} 