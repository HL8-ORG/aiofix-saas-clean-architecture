/**
 * @file delete-department.use-case.ts
 * @description 删除部门用例
 *
 * 该文件实现了删除部门的用例，负责协调命令和查询操作。
 * 该用例是应用层的核心组件，封装了删除部门的完整业务流程。
 *
 * 主要功能：
 * 1. 接收删除部门请求
 * 2. 验证输入数据
 * 3. 执行删除部门命令
 * 4. 返回删除结果
 * 5. 处理异常情况
 *
 * 业务规则：
 * 1. 输入数据必须通过验证
 * 2. 部门必须存在
 * 3. 删除成功后返回删除结果
 * 4. 处理各种业务异常
 * 5. 记录操作日志
 */

import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { DeleteDepartmentCommand } from '../commands/delete-department.command';
import { ICommandBus } from '@aiofix/domain-shared';

/**
 * @class DeleteDepartmentUseCase
 * @description 删除部门用例
 * @implements IUseCase<{ id: string }, void>
 */
@Injectable()
export class DeleteDepartmentUseCase implements IUseCase<{ id: string }, void> {
  /**
   * @constructor
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行删除部门用例
   * @param input 删除部门输入数据
   * @returns {Promise<void>} 返回Promise
   */
  async execute(input: { id: string }): Promise<void> {
    // 创建命令
    const command = new DeleteDepartmentCommand(input);

    // 执行命令
    await this.commandBus.execute(command);
  }
}
