import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserData } from '../decorators/user.decorator';
import { PayloadDto } from '../auth/dto/payload.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from '../utils/mongo/mongooseClassSerializer.interceptor';
import { User } from './schemas/user.schema';

@ApiTags('users')
@Controller('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@UserData() user: PayloadDto): Promise<User> {
    return this.usersService.getProfileInfo(user.userId);
  }
}
