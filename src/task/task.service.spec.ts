import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongo/mongooseTestModule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ProjectService } from '../project/project.service';
import { Model } from 'mongoose';
import { TaskService } from './task.service';
import { Task, TaskSchema } from './schema/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { ProjectModule } from '../project/project.module';
import { CreateProjectDto } from '../project/dto/create-project.dto';
import { NotFoundException } from '@nestjs/common';
import { NOT_FOUND } from './task.constants';

describe('ProjectsService', () => {
  let taskService: TaskService;
  let projectsService: ProjectService;
  let model: Model<Task>;

  const mockProjectId = '64f8a59290054bb3dbb7c20c';
  const mockUserId = '64f8a38ae59f16a20d46c801';

  const mockProject: CreateProjectDto = {
    name: 'Test1',
    userId: mockUserId,
  };

  const mockTask: CreateTaskDto = {
    name: 'Test1',
    projectId: mockProjectId,
  };

  const mockTask2: CreateTaskDto = {
    name: 'Test2',
    projectId: mockProjectId,
  };

  const mockTask3: CreateTaskDto = {
    name: 'Test3',
    projectId: mockProjectId,
  };

  const mockTask4: CreateTaskDto = {
    name: 'Test4',
    projectId: mockProjectId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        ProjectModule,
      ],
      providers: [TaskService],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    projectsService = module.get<ProjectService>(ProjectService);
    model = module.get<Model<Task>>(getModelToken(Task.name));
  });

  describe('Create', () => {
    it('should save new task to db', async () => {
      await projectsService.create(mockUserId, mockProject);

      expect(taskService.create(mockTask)).resolves.toMatchObject(mockTask);
    });

    it('should reject with error', async () => {
      expect(taskService.create(mockTask)).rejects.toEqual(
        new NotFoundException(NOT_FOUND),
      );
    });
  });

  describe('FindOne', () => {
    it('should found task from db by id', async () => {
      const project = await projectsService.create(mockUserId, mockProject);

      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      expect(taskService.findOne(created._id)).resolves.toMatchObject(mockTask);
    });
  });

  describe('Update', () => {
    it('should update task by dto', async () => {
      const project = await projectsService.create(mockUserId, mockProject);
      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      const created2 = await taskService.create({
        ...mockTask2,
        projectId: project._id,
      });

      await taskService.update(created._id, { status: 'done' });

      await expect((await model.findOne({ _id: created._id })).status).toEqual(
        'done',
      );
    });
  });

  describe('Remove', () => {
    it('should remove one task from db by id', async () => {
      const project = await projectsService.create(mockUserId, mockProject);
      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      const created2 = await taskService.create({
        ...mockTask2,
        projectId: project._id,
      });

      await taskService.remove(created._id);

      expect(model.find({ userId: mockUserId })).resolves.toEqual([created2]);
    });
  });

  describe('FindAll', () => {
    it('should found all tasks with query status new', async () => {
      const project = await projectsService.create(mockUserId, mockProject);
      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      const created2 = await taskService.create({
        ...mockTask2,
        projectId: project._id,
      });

      const created3 = await taskService.create({
        ...mockTask3,
        projectId: project._id,
      });

      const created4 = await taskService.create({
        ...mockTask4,
        projectId: project._id,
      });

      await taskService.update(created._id, { status: 'done' });
      await taskService.update(created3._id, { status: 'done' });

      expect(
        taskService.findAll({ status: 'new' }, project._id),
      ).resolves.toEqual([created2, created4]);
    });

    it('should found all tasks with query search by name', async () => {
      const project = await projectsService.create(mockUserId, mockProject);
      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      const created2 = await taskService.create({
        ...mockTask2,
        projectId: project._id,
      });

      const created3 = await taskService.create({
        ...mockTask3,
        projectId: project._id,
      });

      const created4 = await taskService.create({
        ...mockTask4,
        projectId: project._id,
      });

      await taskService.update(created._id, { status: 'done' });
      await taskService.update(created3._id, { status: 'done' });

      expect(
        taskService.findAll({ search: '2' }, project._id),
      ).resolves.toEqual([created2]);
    });

    it('should found all tasks with query any limit', async () => {
      const project = await projectsService.create(mockUserId, mockProject);
      const created = await taskService.create({
        ...mockTask,
        projectId: project._id,
      });

      const created2 = await taskService.create({
        ...mockTask2,
        projectId: project._id,
      });

      const created3 = await taskService.create({
        ...mockTask3,
        projectId: project._id,
      });

      const created4 = await taskService.create({
        ...mockTask4,
        projectId: project._id,
      });

      await taskService.update(created._id, { status: 'done' });
      await taskService.update(created3._id, { status: 'done' });

      expect(taskService.findAll({ limit: 2 }, project._id)).resolves.toEqual([
        created4,
        created3,
      ]);
    });
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });
});
