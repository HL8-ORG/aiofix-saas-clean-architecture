/**
 * @file get-departments.use-case.ts
 * @description 获取部门列表用例
 *
 * 该文件实现了获取部门列表的用例，负责协调查询操作。
 * 该用例是应用层的核心组件，封装了获取部门列表的完整业务流程。
 *
 * 主要功能：
 * 1. 接收获取部门列表请求
 * 2. 验证输入数据
 * 3. 执行获取部门列表查询
 * 4. 返回部门列表信息
 * 5. 处理异常情况
 *
 * 业务规则：
 * 1. 输入数据必须通过验证
 * 2. 支持分页查询
 * 3. 支持多种过滤条件
 * 4. 返回分页部门列表
 * 5. 处理各种业务异常
 * 6. 记录操作日志
 */

import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { GetDepartmentsQuery } from '../queries/get-departments.query';
import { DepartmentResponseDto } from '../dtos/department-response.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { IQueryBus } from '@aiofix/domain-shared';
import { GetDepartmentsQueryData } from '../queries/get-departments.query';

/**
 * @class GetDepartmentsUseCase
 * @description 获取部门列表用例
 * @implements IUseCase<GetDepartmentsQueryData, PaginatedResponseDto<DepartmentResponseDto>>
 */
@Injectable()
export class GetDepartmentsUseCase
  implements
    IUseCase<
      GetDepartmentsQueryData,
      PaginatedResponseDto<DepartmentResponseDto>
    >
{
  /**
   * @constructor
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取部门列表用例
   * @param input 获取部门列表输入数据
   * @returns {Promise<PaginatedResponseDto<DepartmentResponseDto>>} 返回分页部门响应DTO
   */
  async execute(
    input: GetDepartmentsQueryData,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    // 创建查询
    const query = new GetDepartmentsQuery(input);

    // 执行查询
    const departments = await this.queryBus.execute(query);

    return departments as PaginatedResponseDto<DepartmentResponseDto>;
  }
}
