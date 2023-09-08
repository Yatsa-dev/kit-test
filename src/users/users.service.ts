import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
  ) {}

  async save(createUserDto: CreateUserDto): Promise<User> {
    return this.usersModel.create(createUserDto);
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersModel.findOne({ email });
  }

  async findById(userId: string): Promise<User> {
    const user = await this.usersModel.findById(userId);

    return user && user.toObject();
  }

  async getProfileInfo(userId: string): Promise<User> {
    return this.usersModel.findById(userId);
  }
}
