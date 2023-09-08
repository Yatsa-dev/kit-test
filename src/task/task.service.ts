import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schema/task.schema';
import { ProjectService } from '../project/project.service';
import { NOT_FOUND } from './task.constants';
import { GetTasksDto } from './dto/get-task.dto';
import { GetTasksFilters } from './types/data.types';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private tasksModel: Model<TaskDocument>,
    private projectsService: ProjectService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const project = await this.projectsService.findOne(createTaskDto.projectId);

    if (!project) {
      throw new NotFoundException(NOT_FOUND);
    }

    return this.tasksModel.create(createTaskDto);
  }

  parseFilter(query: GetTasksDto) {
    const filters: GetTasksFilters = {};

    if (query.from || query.to) {
      const dateFilter: any = {};

      if (query.from) {
        dateFilter.$gte = new Date(query.from);
      }
      if (query.to) {
        dateFilter.$lt = new Date(query.to);
      }

      filters.createdAt = dateFilter;
    }

    if (query.status) filters.status = query.status;
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      const result = [
        { name: { $regex: regex } },
        { status: { $regex: regex } },
      ];

      filters.$or = result;
    }

    return filters;
  }

  async findAll(query: GetTasksDto, projectId: string): Promise<Task[]> {
    const filters = this.parseFilter(query);

    return this.tasksModel
      .find({ ...filters, projectId })
      .sort(query.sort ? { createdAt: query.sort as any } : { createdAt: -1 })
      .skip(query.offset)
      .limit(query.limit)
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    return this.tasksModel.findById(id);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<{ success: boolean }> {
    await this.tasksModel.findByIdAndUpdate(id, updateTaskDto, { new: true });

    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.tasksModel.findByIdAndDelete(id);

    return { success: true };
  }
}
