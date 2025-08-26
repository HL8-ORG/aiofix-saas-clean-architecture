import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { DeleteOrganizationCommand } from '../commands/delete-organization.command';

/**
 * @class DeleteOrganizationUseCase
 * @description 删除组织用例
 *
 * 主要原理与机制：
 * 1. 实现应用层的业务用例逻辑
 * 2. 使用命令总线发送删除组织命令
 * 3. 协调命令处理器执行具体业务逻辑
 * 4. 提供事务边界和错误处理
 *
 * 功能与业务规则：
 * 1. 接收删除组织请求
 * 2. 验证删除权限
 * 3. 发送删除命令
 * 4. 返回删除结果
 * 5. 处理业务异常
 */
@Injectable()
export class DeleteOrganizationUseCase {
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行删除组织用例
   * @param id 组织ID
   * @param reason 删除原因
   * @returns {Promise<void>}
   */
  async execute(id: string, reason?: string): Promise<void> {
    try {
      // 1. 创建命令
      const command = new DeleteOrganizationCommand({ id, reason });

      // 2. 发送命令并等待结果
      await this.commandBus.execute(command);
    } catch (error) {
      console.error('删除组织用例执行失败:', (error as Error).message);
      throw error;
    }
  }
}
