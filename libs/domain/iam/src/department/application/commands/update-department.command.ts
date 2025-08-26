import { BaseCommand } from '@aiofix/domain-shared';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';

export interface UpdateDepartmentCommandData extends UpdateDepartmentDto {
  id: string;
}

export class UpdateDepartmentCommand extends BaseCommand {
  readonly data: UpdateDepartmentCommandData;

  constructor(data: UpdateDepartmentCommandData) {
    super();
    this.data = data;
  }
}
