import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../decorators/user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { PayloadDto } from './dto/payload.dto';
import { CreateUserDto } from 'src/users/dto/create.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoginResponseDto> {
    return this.authService.signup(createUserDto);
  }

  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @ApiBadRequestResponse({
    status: 400,
    description:
      'Return `Invalid refresh token, make sure the token is correct`',
  })
  @Post('refresh')
  refreshToken(
    @Body() token: { refresh_token: string },
  ): Promise<LoginResponseDto> {
    return this.authService.refresh(token.refresh_token);
  }

  @ApiResponse({ status: 200, description: 'Return `{success: true}`' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout(@User() user: PayloadDto): Promise<{ success: boolean }> {
    console.log('user: ', user);
    return this.authService.logout(user.userId);
  }
}
