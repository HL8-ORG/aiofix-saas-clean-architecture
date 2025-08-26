/**
 * @file create-role.command.ts
 * @description 角色创建命令，定义创建角色的命令对象
 *
 * 主要原理与机制：
 * 1. 实现了ICommand接口，遵循CQRS命令模式
 * 2. 包含创建角色所需的所有数据
 * 3. 支持命令的元数据和追踪信息
 * 4. 提供命令验证和业务规则检查
 *
 * 功能与业务规则：
 * 1. 角色创建的业务逻辑封装
 * 2. 命令数据的完整性验证
 * 3. 支持命令的审计和追踪
 * 4. 提供命令执行的上下文信息
 */

import { ICommand } from '@aiofix/domain-shared';
import { CreateRoleDto } from '../dtos/create-role.dto';

/**
 * @interface CreateRoleCommandData
 * @description 角色创建命令数据接口
 */
export interface CreateRoleCommandData extends CreateRoleDto {}

/**
 * @class CreateRoleCommand
 * @description 角色创建命令
 */
export class CreateRoleCommand implements ICommand {
  readonly commandId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;

  constructor(
    public readonly data: CreateRoleCommandData,
    correlationId?: string,
    causationId?: string,
  ) {
    this.commandId = `create-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
  }
}
