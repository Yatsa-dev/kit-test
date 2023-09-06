import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refreshToken.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BCRYPT,
  INVALID_EMAIL,
  INVALID_REFRESH_TOKEN,
  MOMENT,
  WRONG_PASSWORD,
} from './auth.constants';
import { User } from '../users/schemas/user.schema';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @Inject(BCRYPT) private bcrypt,
    @Inject(MOMENT) private moment,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(INVALID_EMAIL);
    }
    const passIsCorrect = await this.bcrypt.compare(password, user.password);

    if (!passIsCorrect) {
      throw new UnauthorizedException(WRONG_PASSWORD);
    }
    return user;
  }

  async createRefreshToken(userId: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenModel.create({
      createdAt: Date.now(),
      userId: userId,
    });
    return refreshToken && refreshToken.toObject();
  }

  async findRefreshTokenById(tokenId: string): Promise<RefreshToken> {
    const token = await this.refreshTokenModel.findById(tokenId);

    return token && token.toObject();
  }

  async signup(createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    const hash = await this.bcrypt.hash(
      createUserDto.password,
      this.configService.get<number>('saltRounds'),
    );
    createUserDto.password = hash;
    const user = await this.usersService.save(createUserDto);

    return this.generateCredentials(user);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    return this.generateCredentials(user);
  }

  async refresh(token: string): Promise<LoginResponseDto> {
    const refreshToken = await this.findRefreshTokenById(token);
    if (!refreshToken) {
      throw new BadRequestException(INVALID_REFRESH_TOKEN);
    }
    const user = await this.usersService.findById(refreshToken.userId);

    const loginDto: LoginDto = { email: user.email, password: user.password };

    return this.login(loginDto);
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    const refresh = await this.refreshTokenModel.findOne({ userId });
    await this.refreshTokenModel.findByIdAndDelete(refresh);

    return { success: true };
  }

  async generateCredentials(user: User) {
    const payload = { userId: user._id, email: user.email };
    const refreshToken = await this.createRefreshToken(user._id);

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwtSecret'),
      }),
      expires_at: this.moment()
        .add(this.configService.get<number>('jwtExpiresInt'), 'seconds')
        .unix(),
      refresh_token: refreshToken._id,
    };
  }
}
