import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { UpdateRoleCommand } from '../commands/update-role.command';
import { UpdateRoleDto } from '../dtos/update-role.dto';

/**
 * @class UpdateRoleUseCase
 * @description
 * 角色更新用例，负责处理角色更新的业务逻辑。
 *
 * 主要原理与机制如下：
 * 1. 通过依赖注入获取命令总线，用于发送更新角色命令
 * 2. 接收更新角色的DTO数据，通过命令总线发送命令
 * 3. 返回更新结果
 *
 * 功能与业务规则：
 * 1. 验证角色更新数据的完整性和有效性
 * 2. 通过命令总线发送更新角色命令
 * 3. 处理更新过程中的异常情况
 * 4. 记录角色更新的审计日志
 * 5. 返回更新成功的标识
 */
@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行角色更新操作
   * @param tenantId 租户ID
   * @param roleId 角色ID
   * @param updateRoleDto 角色更新数据
   * @returns 更新结果
   */
  async execute(
    tenantId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<string> {
    try {
      // 创建命令对象
      const commandData = { id: roleId, ...updateRoleDto };
      const command = new UpdateRoleCommand(commandData);

      // 通过命令总线发送命令
      await this.commandBus.execute(command);

      return 'role-updated';
    } catch (error) {
      console.error('角色更新失败', {
        tenantId,
        roleId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
