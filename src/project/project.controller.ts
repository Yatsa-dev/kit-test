import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { PayloadDto } from '../auth/dto/payload.dto';
import { User } from '../decorators/user.decorator';
import { ProjectResponse } from './dto/project-response.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @User() user: PayloadDto,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponse> {
    return this.projectService.create(user.userId, createProjectDto);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@User() user: PayloadDto): Promise<ProjectResponse[]> {
    return this.projectService.findAll(user.userId);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProjectResponse> {
    return this.projectService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ status: 200, description: 'Return `{success: true}`' })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<{ success: boolean }> {
    return this.projectService.update(id, updateProjectDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return `{success: true}`' })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.projectService.remove(id);
  }
}
