import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongo/mongooseTestModule';
import { CreateUserDto } from '../users/dto/create.dto';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

describe('UsersService', () => {
  let userService: UsersService;

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
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

        UsersModule,
      ],
      providers: [UsersService],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  describe('Save', () => {
    it('should save new user to db', async () => {
      await expect(userService.save(mockUser)).resolves.toMatchObject(mockUser);
    });
  });

  describe('FindByEmail', () => {
    it('should found user from db by email', async () => {
      const user = await userService.save(mockUser);

      expect(userService.findByEmail(user.email)).resolves.toMatchObject(user);
    });
  });

  describe('FindById', () => {
    it('should found user from db by id', async () => {
      const user = await userService.save(mockUser);

      expect(userService.findById(user._id)).resolves.toMatchObject(mockUser);
    });
  });

  describe('GetProfileInfo', () => {
    it('should found user from db by id and return without password', async () => {
      const user = await userService.save(mockUser);

      expect(userService.getProfileInfo(user._id)).resolves.toMatchObject({
        name: 'Ihor Yatsa',
        email: 'yacaa21@gmail.com',
      });
    });
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });
});
