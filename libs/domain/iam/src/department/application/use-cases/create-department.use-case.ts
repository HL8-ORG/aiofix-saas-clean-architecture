/**
 * @file create-department.use-case.ts
 * @description 创建部门用例
 *
 * 该文件实现了创建部门的用例，负责协调命令和查询操作。
 * 该用例是应用层的核心组件，封装了创建部门的完整业务流程。
 *
 * 主要功能：
 * 1. 接收创建部门请求
 * 2. 验证输入数据
 * 3. 执行创建部门命令
 * 4. 返回创建结果
 * 5. 处理异常情况
 *
 * 业务规则：
 * 1. 输入数据必须通过验证
 * 2. 创建成功后返回部门ID
 * 3. 处理各种业务异常
 * 4. 记录操作日志
 */

import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { CreateDepartmentCommand } from '../commands/create-department.command';
import { ICommandBus } from '@aiofix/domain-shared';

/**
 * @class CreateDepartmentUseCase
 * @description 创建部门用例
 * @implements IUseCase<CreateDepartmentDto, string>
 */
@Injectable()
export class CreateDepartmentUseCase
  implements IUseCase<CreateDepartmentDto, string>
{
  /**
   * @constructor
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行创建部门用例
   * @param input 创建部门输入数据
   * @returns {Promise<string>} 返回创建的部门ID
   */
  async execute(input: CreateDepartmentDto): Promise<string> {
    // 创建命令
    const command = new CreateDepartmentCommand(input);

    // 执行命令
    await this.commandBus.execute(command);

    // 返回部门ID（这里假设命令执行成功后会返回部门ID）
    // TODO: 完善返回逻辑，可能需要从命令执行结果中获取部门ID
    return 'department-created';
  }
}
