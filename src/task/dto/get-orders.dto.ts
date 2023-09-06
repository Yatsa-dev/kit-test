import { Transform } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class GetTasksDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  sort?: number;

  from?: Date;
  to?: Date;
  search?: string;
  status?: string;
}
