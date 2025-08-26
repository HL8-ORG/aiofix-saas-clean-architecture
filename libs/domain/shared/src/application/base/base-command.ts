import { ICommand } from '../interfaces/command.interface';

/**
 * @class BaseCommand
 * @description 基础命令类，提供命令的基础功能
 *
 * 主要原理与机制：
 * 1. 实现ICommand接口，提供命令的基础功能
 * 2. 自动生成命令ID和时间戳
 * 3. 支持关联ID和因果ID用于事件链追踪
 * 4. 提供命令的元数据管理
 *
 * 功能与业务规则：
 * 1. 提供统一的命令标识
 * 2. 支持命令的元数据管理
 * 3. 支持命令的版本控制
 * 4. 支持命令的审计和追踪
 */
export abstract class BaseCommand implements ICommand {
  /**
   * @property commandId
   * @description 命令唯一标识符
   */
  readonly commandId: string;

  /**
   * @property timestamp
   * @description 命令创建时间戳
   */
  readonly timestamp: Date;

  /**
   * @property correlationId
   * @description 关联ID，用于追踪业务流程
   */
  readonly correlationId?: string;

  /**
   * @property causationId
   * @description 因果ID，用于追踪事件链
   */
  readonly causationId?: string;

  /**
   * @property tenantId
   * @description 租户ID
   */
  readonly tenantId?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param correlationId 关联ID
   * @param causationId 因果ID
   * @param tenantId 租户ID
   */
  constructor(correlationId?: string, causationId?: string, tenantId?: string) {
    this.commandId = this.generateCommandId();
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
    this.tenantId = tenantId;
  }

  /**
   * @method generateCommandId
   * @description 生成命令ID
   * @returns 命令ID
   */
  private generateCommandId(): string {
    return `${this.constructor.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
