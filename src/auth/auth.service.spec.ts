import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongo/mongooseTestModule';
import { AuthService } from './auth.service';
import { RefreshToken, RefreshTokenShema } from './schemas/refreshToken.schema';
import {
  BCRYPT,
  INVALID_EMAIL,
  INVALID_REFRESH_TOKEN,
  MOMENT,
  WRONG_PASSWORD,
} from './auth.constants';
import { CreateUserDto } from '../users/dto/create.dto';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import configuration from '../config/configuration';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UsersService;
  let model: Model<RefreshToken>;
  let userModel: Model<User>;

  const mockUser: CreateUserDto = {
    name: 'Ihor Yatsa',
    email: 'yacaa21@gmail.com',
    password: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: RefreshToken.name, schema: RefreshTokenShema },
          { name: User.name, schema: UserSchema },
        ]),
        JwtModule.registerAsync({
          useFactory: () => {
            return {
              secret: 'jwtSecret',
              signOptions: {
                expiresIn: 3600,
              },
            };
          },
        }),
        UsersModule,
      ],
      providers: [
        {
          provide: BCRYPT,
          useValue: bcrypt,
        },
        {
          provide: MOMENT,
          useValue: moment,
        },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<RefreshToken>>(getModelToken(RefreshToken.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('Validate', () => {
    it('should check success validate', async () => {
      await authService.signup(mockUser);
      const user = await userModel.findOne();

      await expect(
        authService.validateUser(mockUser.email, 'test'),
      ).resolves.toMatchObject(user.toObject());
    });
    it('should reject with error if user already exist', async () => {
      const email = 'undefined';
      const password = 'undefined';

      await expect(authService.validateUser(email, password)).rejects.toEqual(
        new UnauthorizedException(INVALID_EMAIL),
      );
    });

    it('should reject with error if password wrong', async () => {
      await userService.save(mockUser);
      const user = await userModel.findOne();

      await userModel.findByIdAndUpdate(user._id, { password: '1234' });

      const wrongPassword = '12341234';
      await expect(
        authService.validateUser(user.email, wrongPassword),
      ).rejects.toEqual(new UnauthorizedException(WRONG_PASSWORD));
    });
  });

  describe('SignUp', () => {
    it('should create new user', async () => {
      const credentials = await authService.signup(mockUser);
      const user = await userModel.findOne();

      const payload = await jwtService.decode(credentials.access_token);

      expect(payload).toMatchObject({ userId: user.id, email: user.email });
    });
  });

  describe('CreateRefreshToken', () => {
    it('should create refreshToken', async () => {
      await authService.signup(mockUser);

      const user = await userModel.findOne();

      const refreshToken = await authService.createRefreshToken(user.id);

      const currentRefreshToken = await model.findById(refreshToken._id);

      await expect(currentRefreshToken.userId).toEqual(user.id);
    });
  });

  describe('FindRefreshTokenById', () => {
    it('should find refreshToken by id', async () => {
      await authService.signup(mockUser);

      const user = await userModel.findOne();

      const refreshToken = await authService.createRefreshToken(user.id);

      await expect(
        authService.findRefreshTokenById(refreshToken._id),
      ).resolves.toMatchObject(refreshToken);
    });
  });

  describe('Refresh Token', () => {
    it('should reject with error if refresh token wrong', async () => {
      await authService.signup(mockUser);

      const user = await userModel.findOne();

      await authService.createRefreshToken(user.id);

      const wrongRefreshToken = '62d15bab1b52ed79e63e644b';

      await expect(authService.refresh(wrongRefreshToken)).rejects.toEqual(
        new BadRequestException(INVALID_REFRESH_TOKEN),
      );
    });

    it('should resolve if refresh token correct', async () => {
      await authService.signup(mockUser);

      const user = await userModel.findOne();

      const refreshToken = await authService.createRefreshToken(user.id);

      await expect(model.findById(refreshToken._id)).resolves.toMatchObject(
        refreshToken,
      );
    });
  });

  describe('Login', () => {
    it('should return valid credentials', async () => {
      await authService.signup(mockUser);

      const createdUser = await userModel.findOne();

      const user = await userModel.findOne({ email: createdUser.email });
      const credentials = await authService.login({
        email: createdUser.email,
        password: createdUser.password,
      });

      expect(credentials.access_token).toBeDefined();
      expect(credentials.expires_at).toBeDefined();
      expect(credentials.refresh_token).toBeDefined();

      const payload = await jwtService.decode(credentials.access_token);

      expect(payload).toMatchObject({ userId: user.id, email: user.email });
    });
  });

  describe('Logout', () => {
    it('should to do logout', async () => {
      const credentials = await authService.signup(mockUser);

      const payload = await jwtService.decode(credentials.access_token);

      await authService.logout(payload['userId']);

      expect(await model.findById(credentials.refresh_token)).toEqual(null);
    });
  });
  afterAll(async () => {
    await closeInMongodConnection();
  });
});
