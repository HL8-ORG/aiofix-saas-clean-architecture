import { BaseCommand } from '@aiofix/domain-shared';

/**
 * @interface DeleteOrganizationCommandData
 * @description 删除组织命令数据
 */
export interface DeleteOrganizationCommandData {
  id: string;
  reason?: string;
}

/**
 * @class DeleteOrganizationCommand
 * @description 删除组织命令
 */
export class DeleteOrganizationCommand extends BaseCommand {
  /**
   * @property data
   * @description 命令数据
   */
  readonly data: DeleteOrganizationCommandData;

  constructor(data: DeleteOrganizationCommandData) {
    super();
    this.data = data;
  }
}
