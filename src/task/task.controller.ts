import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetTasksDto } from './dto/get-orders.dto';
import { TaskResponse } from './dto/task-response.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Return `This project not found`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    return this.taskService.create(createTaskDto);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':projectId')
  findAll(
    @Query() query: GetTasksDto,
    @Param('projectId') projectId: string,
  ): Promise<TaskResponse[]> {
    return this.taskService.findAll(query, projectId);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('single/:id')
  findOne(@Param('id') id: string): Promise<TaskResponse> {
    return this.taskService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return `{success: true}`' })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Return `Unauthorized`',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<{ success: boolean }> {
    return this.taskService.update(id, updateTaskDto);
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
    return this.taskService.remove(id);
  }
}
