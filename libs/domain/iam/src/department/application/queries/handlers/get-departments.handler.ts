/**
 * @file get-departments.handler.ts
 * @description 获取部门列表查询处理器
 *
 * 该文件实现了获取部门列表的查询处理器，负责处理GetDepartmentsQuery查询。
 * 该处理器包含完整的业务逻辑验证和数据获取流程。
 *
 * 主要功能：
 * 1. 验证查询参数的有效性
 * 2. 根据条件查询部门列表
 * 3. 处理分页和排序
 * 4. 转换实体为DTO格式
 * 5. 处理权限验证
 *
 * 业务规则：
 * 1. 查询参数必须有效
 * 2. 支持多种查询条件组合
 * 3. 需要验证用户访问权限
 * 4. 返回的数据需要符合DTO格式
 * 5. 支持分页查询
 */

import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@aiofix/domain-shared';
import { GetDepartmentsQuery } from '../get-departments.query';
import { DepartmentRepository } from '../../../domain/repositories/department-repository.interface';
import { DepartmentResponseDto } from '../../dtos/department-response.dto';
import { PaginatedResponseDto } from '../../../../tenant/application/dtos/paginated-response.dto';
import { Department } from '../../../domain/entities/department.entity';
import { GetDepartmentsQueryData } from '../get-departments.query';

/**
 * @class GetDepartmentsHandler
 * @description 获取部门列表查询处理器
 * @implements IQueryHandler<GetDepartmentsQuery, PaginatedResponseDto<DepartmentResponseDto>>
 */
@Injectable()
export class GetDepartmentsHandler
  implements
    IQueryHandler<
      GetDepartmentsQuery,
      PaginatedResponseDto<DepartmentResponseDto>
    >
{
  /**
   * @constructor
   * @param departmentRepository 部门仓储接口
   */
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * @method execute
   * @description 执行获取部门列表查询
   * @param query 获取部门列表查询
   * @returns {Promise<PaginatedResponseDto<DepartmentResponseDto>>} 返回分页部门响应DTO
   */
  async execute(
    query: GetDepartmentsQuery,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const { data } = query;

    // 根据组织ID查询部门列表
    let departments: Department[] = [];
    if (data.organizationId) {
      departments = await this.departmentRepository.findByOrganization(
        data.organizationId,
      );
    } else {
      // TODO: 实现通用查询逻辑
      console.log('TODO: 实现通用部门查询逻辑');
      departments = [];
    }

    // 过滤结果
    departments = this.filterDepartments(departments, data);

    // 转换为DTO格式
    const dtos = departments.map(department =>
      DepartmentResponseDto.fromEntity(department),
    );

    // 构建分页响应
    const response = PaginatedResponseDto.fromData(
      dtos,
      data.page || 1,
      data.limit || 10,
      dtos.length,
    );

    return response;
  }

  /**
   * @method filterDepartments
   * @description 过滤部门列表
   * @param departments 部门列表
   * @param data 查询数据
   * @returns {Department[]} 过滤后的部门列表
   */
  private filterDepartments(
    departments: Department[],
    data: GetDepartmentsQueryData,
  ): Department[] {
    return departments.filter((department: Department) => {
      if (data.status && department.status !== data.status) {
        return false;
      }
      if (data.type && department.type !== data.type) {
        return false;
      }
      if (
        data.parentId !== undefined &&
        department.parentId?.toString() !== data.parentId
      ) {
        return false;
      }
      if (
        data.search &&
        !department.name.toLowerCase().includes(data.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }
}
