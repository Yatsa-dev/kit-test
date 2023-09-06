import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schema/project.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private projectsModel: Model<ProjectDocument>,
  ) {}

  async create(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    createProjectDto.userId = userId;

    return this.projectsModel.create(createProjectDto);
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectsModel.find({ userId });
  }

  async findOne(id: string): Promise<Project> {
    return this.projectsModel.findById(id);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<{ success: boolean }> {
    await this.projectsModel.findByIdAndUpdate(id, updateProjectDto, {
      new: true,
    });

    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.projectsModel.findByIdAndDelete(id);

    return { success: true };
  }
}
