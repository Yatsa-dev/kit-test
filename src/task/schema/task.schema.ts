import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Project } from '../../project/schema/project.schema';
import { Statuses } from '../task.constants';

export type TaskDocument = Task & Document;

@Schema({ versionKey: false, timestamps: true })
export class Task {
  _id: string;

  id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  projectId: Project;

  @Prop({ enum: Statuses, default: Statuses.NEW })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('toObject', { virtuals: true });
