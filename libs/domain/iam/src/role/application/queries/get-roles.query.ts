/**
 * @file get-roles.query.ts
 * @description 获取角色列表查询，定义获取角色列表的查询对象
 *
 * 主要原理与机制：
 * 1. 实现了IQuery接口，遵循CQRS查询模式
 * 2. 包含获取角色列表所需的所有参数
 * 3. 支持分页、过滤、排序等功能
 * 4. 提供查询验证和权限检查
 *
 * 功能与业务规则：
 * 1. 角色列表查询的业务逻辑封装
 * 2. 查询参数的完整性验证
 * 3. 支持分页和过滤功能
 * 4. 提供查询执行的上下文信息
 */

import { IQuery } from '@aiofix/domain-shared';
import { RoleResponseDto } from '../dtos/role-response.dto';

/**
 * @interface GetRolesQueryData
 * @description 获取角色列表查询数据接口
 */
export interface GetRolesQueryData {
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 父角色ID */
  parentId?: string;
  /** 角色类型 */
  type?: string;
  /** 角色状态 */
  status?: string;
  /** 是否启用 */
  isActive?: boolean;
  /** 搜索关键词 */
  search?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 是否包含权限信息 */
  includePermissions?: boolean;
  /** 是否包含成员信息 */
  includeMembers?: boolean;
  /** 是否包含子角色信息 */
  includeChildren?: boolean;
}

/**
 * @class GetRolesQuery
 * @description 获取角色列表查询
 */
export class GetRolesQuery implements IQuery<RoleResponseDto[]> {
  readonly queryId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;

  constructor(
    public readonly data: GetRolesQueryData,
    correlationId?: string,
    causationId?: string,
  ) {
    this.queryId = `get-roles-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
  }
}
