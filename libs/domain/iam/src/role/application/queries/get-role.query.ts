/**
 * @file get-role.query.ts
 * @description 获取角色查询，定义获取单个角色的查询对象
 *
 * 主要原理与机制：
 * 1. 实现了IQuery接口，遵循CQRS查询模式
 * 2. 包含获取角色所需的所有参数
 * 3. 支持查询的元数据和追踪信息
 * 4. 提供查询验证和权限检查
 *
 * 功能与业务规则：
 * 1. 角色查询的业务逻辑封装
 * 2. 查询参数的完整性验证
 * 3. 支持查询的审计和追踪
 * 4. 提供查询执行的上下文信息
 */

import { IQuery } from '@aiofix/domain-shared';
import { RoleResponseDto } from '../dtos/role-response.dto';

/**
 * @interface GetRoleQueryData
 * @description 获取角色查询数据接口
 */
export interface GetRoleQueryData {
  /** 角色ID */
  id: string;
  /** 是否包含权限信息 */
  includePermissions?: boolean;
  /** 是否包含成员信息 */
  includeMembers?: boolean;
  /** 是否包含子角色信息 */
  includeChildren?: boolean;
}

/**
 * @class GetRoleQuery
 * @description 获取角色查询
 */
export class GetRoleQuery implements IQuery<RoleResponseDto> {
  readonly queryId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;

  constructor(
    public readonly data: GetRoleQueryData,
    correlationId?: string,
    causationId?: string,
  ) {
    this.queryId = `get-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
  }
}
