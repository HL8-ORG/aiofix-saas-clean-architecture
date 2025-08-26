/**
 * @file get-department.use-case.ts
 * @description 获取部门用例
 *
 * 该文件实现了获取部门的用例，负责协调查询操作。
 * 该用例是应用层的核心组件，封装了获取部门的完整业务流程。
 *
 * 主要功能：
 * 1. 接收获取部门请求
 * 2. 验证输入数据
 * 3. 执行获取部门查询
 * 4. 返回部门信息
 * 5. 处理异常情况
 *
 * 业务规则：
 * 1. 输入数据必须通过验证
 * 2. 部门必须存在
 * 3. 返回部门详细信息
 * 4. 处理各种业务异常
 * 5. 记录操作日志
 */

import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { GetDepartmentQuery } from '../queries/get-department.query';
import { DepartmentResponseDto } from '../dtos/department-response.dto';
import { IQueryBus } from '@aiofix/domain-shared';

/**
 * @class GetDepartmentUseCase
 * @description 获取部门用例
 * @implements IUseCase<{ id: string }, DepartmentResponseDto>
 */
@Injectable()
export class GetDepartmentUseCase
  implements IUseCase<{ id: string }, DepartmentResponseDto>
{
  /**
   * @constructor
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取部门用例
   * @param input 获取部门输入数据
   * @returns {Promise<DepartmentResponseDto>} 返回部门响应DTO
   */
  async execute(input: { id: string }): Promise<DepartmentResponseDto> {
    // 创建查询
    const query = new GetDepartmentQuery(input);

    // 执行查询
    const department = await this.queryBus.execute(query);

    return department as DepartmentResponseDto;
  }
}
