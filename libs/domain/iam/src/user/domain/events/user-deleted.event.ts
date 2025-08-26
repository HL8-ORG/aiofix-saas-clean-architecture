/**
 * @file user-deleted.event.ts
 * @description 用户删除事件
 *
 * 该文件定义了用户删除事件，当用户被删除时触发。
 * 该事件包含用户删除时的所有相关信息。
 *
 * 主要功能：
 * 1. 记录用户删除事件
 * 2. 包含用户删除时的完整信息
 * 3. 支持事件溯源和审计
 * 4. 支持多租户数据隔离
 *
 * 业务规则：
 * 1. 用户删除事件必须包含用户的基本信息
 * 2. 用户删除事件必须包含租户信息
 * 3. 用户删除事件必须包含删除者信息
 * 4. 用户删除事件必须记录删除时间
 */

import { BaseEvent } from '@aiofix/domain-shared';
import { User } from '../entities/user.entity';

/**
 * @interface UserDeletedEventData
 * @description 用户删除事件数据接口
 */
export interface UserDeletedEventData {
  userId: string;
  username: string;
  email: string;
  tenantId: string;
  organizationId: string;
  deletedBy?: string;
  reason?: string;
  remark?: string;
  deletedAt: Date;
}

/**
 * @class UserDeletedEvent
 * @description 用户删除领域事件
 *
 * 主要原理与机制：
 * 1. 继承BaseEvent基类，实现事件溯源
 * 2. 记录用户删除的完整信息
 * 3. 支持审计追踪和业务分析
 *
 * 功能与业务规则：
 * 1. 记录用户删除事件
 * 2. 支持事件溯源
 * 3. 提供审计信息
 */
export class UserDeletedEvent extends BaseEvent {
  public readonly eventData: UserDeletedEventData;

  constructor(
    user: User,
    deletedBy?: string,
    reason?: string,
    remark?: string,
    correlationId?: string,
    causationId?: string,
  ) {
    super('UserDeleted', correlationId || '', causationId || '');

    this.eventData = {
      userId: user.id.value,
      username: user.username.value,
      email: user.email.value,
      tenantId: user.tenantId.value,
      organizationId: user.organizationId?.value || '',
      deletedBy,
      reason,
      remark,
      deletedAt: new Date(),
    };
  }

  /**
   * @method serializeEventData
   * @description 序列化事件数据
   * @returns 序列化后的事件数据
   */
  protected serializeEventData(): Record<string, any> {
    return this.eventData;
  }
}
