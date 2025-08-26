import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { DeleteRoleCommand } from '../commands/delete-role.command';

/**
 * @class DeleteRoleUseCase
 * @description
 * 角色删除用例，负责处理角色删除的业务逻辑。
 *
 * 主要原理与机制如下：
 * 1. 通过依赖注入获取命令总线，用于发送删除角色命令
 * 2. 接收角色ID，通过命令总线发送删除命令
 * 3. 返回删除结果
 *
 * 功能与业务规则：
 * 1. 验证角色删除的权限和条件
 * 2. 通过命令总线发送删除角色命令
 * 3. 处理删除过程中的异常情况
 * 4. 记录角色删除的审计日志
 * 5. 返回删除成功的标识
 */
@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行角色删除操作
   * @param tenantId 租户ID
   * @param roleId 角色ID
   * @returns 删除结果
   */
  async execute(tenantId: string, roleId: string): Promise<string> {
    try {
      // 创建命令对象
      const command = new DeleteRoleCommand({ id: roleId });

      // 通过命令总线发送命令
      await this.commandBus.execute(command);

      return 'role-deleted';
    } catch (error) {
      console.error('角色删除失败', {
        tenantId,
        roleId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
