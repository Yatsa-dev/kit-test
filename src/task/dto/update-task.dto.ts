import { IsString, IsEnum } from 'class-validator';
import { Statuses } from '../task.constants';

export class UpdateTaskDto {
  @IsString()
  @IsEnum(Statuses)
  status: string;
}
