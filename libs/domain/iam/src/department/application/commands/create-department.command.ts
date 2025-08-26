import { BaseCommand } from '@aiofix/domain-shared';
import { CreateDepartmentDto } from '../dtos/create-department.dto';

/**
 * @interface CreateDepartmentCommandData
 * @description 创建部门命令数据接口
 */
export interface CreateDepartmentCommandData extends CreateDepartmentDto {}

/**
 * @class CreateDepartmentCommand
 * @description 创建部门命令
 *
 * 主要功能：
 * 1. 封装创建部门的业务命令
 * 2. 继承BaseCommand基类
 * 3. 包含完整的部门创建数据
 * 4. 支持命令总线分发
 */
export class CreateDepartmentCommand extends BaseCommand {
  readonly data: CreateDepartmentCommandData;

  constructor(data: CreateDepartmentCommandData) {
    super();
    this.data = data;
  }
}
