import { PartialType } from '@nestjs/swagger';
import { Task } from '../schema/task.schema';
import mongoose from 'mongoose';

export class TaskResponse extends PartialType(Task) {
  _id: string;
  name: string;
  projectId: mongoose.Schema.Types.ObjectId | any;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
