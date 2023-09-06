import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../utils/mongo/mongooseTestModule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectSchema } from './schema/project.schema';
import { Model } from 'mongoose';

describe('ProjectsService', () => {
  let projectsService: ProjectService;
  let model: Model<Project>;

  const mockUserId = '64f8a38ae59f16a20d46c801';

  const mockProject: CreateProjectDto = {
    name: 'Test1',
    userId: mockUserId,
  };

  const mockProject2: CreateProjectDto = {
    name: 'Test2',
    userId: mockUserId,
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
          { name: Project.name, schema: ProjectSchema },
        ]),
      ],
      providers: [ProjectService],
    }).compile();

    projectsService = module.get<ProjectService>(ProjectService);
    model = module.get<Model<Project>>(getModelToken(Project.name));
  });

  describe('Create', () => {
    it('should save new project to db', async () => {
      await expect(
        projectsService.create(mockUserId, mockProject),
      ).resolves.toMatchObject(mockProject);
    });
  });

  describe('FindOne', () => {
    it('should found project from db by id', async () => {
      const created = projectsService.create(mockUserId, mockProject);

      expect(
        projectsService.findOne((await created).id),
      ).resolves.toMatchObject(mockProject);
    });
  });

  describe('Update', () => {
    it('should update project by dto', async () => {
      const created = await projectsService.create(mockUserId, mockProject);
      await projectsService.update(created._id, { name: 'Test2023' });

      await expect((await model.findOne({ _id: created._id })).name).toEqual(
        'Test2023',
      );
    });
  });

  describe('Remove', () => {
    it('should remove one project from db by id', async () => {
      const created = await projectsService.create(mockUserId, mockProject);
      const created2 = await projectsService.create(mockUserId, mockProject2);

      await projectsService.remove(created._id);

      expect(model.find({ userId: mockUserId })).resolves.toEqual([created2]);
    });
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });
});
