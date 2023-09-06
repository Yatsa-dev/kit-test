import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ versionKey: false })
export class Project {
  _id: string;

  id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.set('toObject', { virtuals: true });
