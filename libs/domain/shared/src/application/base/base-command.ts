import { ICommand } from '../interfaces/command.interface';
import { Uuid } from '../../domain/value-objects/uuid.vo';

/**
 * @class BaseCommand
 * @description 基础命令类，提供命令的通用实现
 *
 * 主要原理与机制：
 * 1. 实现了ICommand接口，提供命令的基础功能
 * 2. 自动生成命令ID和时间戳，确保命令的唯一性和可追溯性
 * 3. 支持用户和租户上下文信息的设置
 * 4. 作为所有具体命令的基类，提供统一的命令行为
 *
 * 功能与业务规则：
 * 1. 提供命令的唯一标识符生成
 * 2. 提供命令的时间戳记录
 * 3. 支持命令的上下文信息管理
 * 4. 确保命令的不可变性
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
   * @property userId
   * @description 执行命令的用户ID
   */
  readonly userId?: string;

  /**
   * @property tenantId
   * @description 命令所属的租户ID
   */
  readonly tenantId?: string;

  /**
   * @constructor
   * @description 构造函数，初始化命令的基础属性
   * @param userId 执行命令的用户ID
   * @param tenantId 命令所属的租户ID
   */
  constructor(userId?: string, tenantId?: string) {
    this.commandId = Uuid.generate().value;
    this.timestamp = new Date();
    this.userId = userId;
    this.tenantId = tenantId;
  }
}
