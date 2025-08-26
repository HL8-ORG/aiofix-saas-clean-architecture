import { BaseCommand } from '@aiofix/domain-shared';

export interface DeleteDepartmentCommandData {
  id: string;
  reason?: string;
}

export class DeleteDepartmentCommand extends BaseCommand {
  readonly data: DeleteDepartmentCommandData;

  constructor(data: DeleteDepartmentCommandData) {
    super();
    this.data = data;
  }
}
