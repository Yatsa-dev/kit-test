import { PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../base/dto/pagination.dto';

export class GetTasksDto extends PartialType(PaginationDto) {
  from?: Date;
  to?: Date;
  status?: string;
}
