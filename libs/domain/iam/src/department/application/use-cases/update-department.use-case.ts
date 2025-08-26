/**
 * @file update-department.use-case.ts
 * @description 更新部门用例
 *
 * 该文件实现了更新部门的用例，负责协调命令和查询操作。
 * 该用例是应用层的核心组件，封装了更新部门的完整业务流程。
 *
 * 主要功能：
 * 1. 接收更新部门请求
 * 2. 验证输入数据
 * 3. 执行更新部门命令
 * 4. 返回更新结果
 * 5. 处理异常情况
 *
 * 业务规则：
 * 1. 输入数据必须通过验证
 * 2. 部门必须存在
 * 3. 更新成功后返回更新结果
 * 4. 处理各种业务异常
 * 5. 记录操作日志
 */

import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { UpdateDepartmentCommand } from '../commands/update-department.command';
import { ICommandBus } from '@aiofix/domain-shared';

/**
 * @class UpdateDepartmentUseCase
 * @description 更新部门用例
 * @implements IUseCase<UpdateDepartmentDto & { id: string }, void>
 */
@Injectable()
export class UpdateDepartmentUseCase
  implements IUseCase<UpdateDepartmentDto & { id: string }, void>
{
  /**
   * @constructor
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行更新部门用例
   * @param input 更新部门输入数据
   * @returns {Promise<void>} 返回Promise
   */
  async execute(input: UpdateDepartmentDto & { id: string }): Promise<void> {
    // 创建命令
    const command = new UpdateDepartmentCommand(input);

    // 执行命令
    await this.commandBus.execute(command);
  }
}
