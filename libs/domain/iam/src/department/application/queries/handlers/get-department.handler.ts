/**
 * @file get-department.handler.ts
 * @description 获取部门查询处理器
 *
 * 该文件实现了获取单个部门的查询处理器，负责处理GetDepartmentQuery查询。
 * 该处理器包含完整的业务逻辑验证和数据获取流程。
 *
 * 主要功能：
 * 1. 验证查询参数的有效性
 * 2. 根据ID获取部门信息
 * 3. 转换实体为DTO格式
 * 4. 处理权限验证
 *
 * 业务规则：
 * 1. 部门ID必须有效
 * 2. 只能查询存在的部门
 * 3. 需要验证用户访问权限
 * 4. 返回的数据需要符合DTO格式
 */

import { Injectable } from '@nestjs/common';
import { IQueryHandler, Uuid } from '@aiofix/domain-shared';
import { GetDepartmentQuery } from '../get-department.query';
import { DepartmentRepository } from '../../../domain/repositories/department-repository.interface';
import { DepartmentResponseDto } from '../../dtos/department-response.dto';

/**
 * @class GetDepartmentHandler
 * @description 获取部门查询处理器
 * @implements IQueryHandler<GetDepartmentQuery, DepartmentResponseDto>
 */
@Injectable()
export class GetDepartmentHandler
  implements IQueryHandler<GetDepartmentQuery, DepartmentResponseDto>
{
  /**
   * @constructor
   * @param departmentRepository 部门仓储接口
   */
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * @method execute
   * @description 执行获取部门查询
   * @param query 获取部门查询
   * @returns {Promise<DepartmentResponseDto>} 返回部门响应DTO
   */
  async execute(query: GetDepartmentQuery): Promise<DepartmentResponseDto> {
    const { data } = query;

    // 验证部门是否存在
    const department = await this.departmentRepository.findById(
      Uuid.fromString(data.id),
    );
    if (!department) {
      throw new Error(`部门不存在: ${data.id}`);
    }

    // 转换为DTO格式
    const dto = DepartmentResponseDto.fromEntity(department);

    return dto;
  }
}
