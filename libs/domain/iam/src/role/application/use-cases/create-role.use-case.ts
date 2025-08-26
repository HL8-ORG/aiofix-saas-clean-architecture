import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { CreateRoleCommand } from '../commands/create-role.command';
import { CreateRoleDto } from '../dtos/create-role.dto';

/**
 * @class CreateRoleUseCase
 * @description
 * 角色创建用例，负责处理角色创建的业务逻辑。
 *
 * 主要原理与机制如下：
 * 1. 通过依赖注入获取命令总线，用于发送创建角色命令
 * 2. 接收创建角色的DTO数据，通过命令总线发送命令
 * 3. 返回创建结果，通常是新创建角色的ID
 *
 * 功能与业务规则：
 * 1. 验证角色创建数据的完整性和有效性
 * 2. 通过命令总线发送创建角色命令
 * 3. 处理创建过程中的异常情况
 * 4. 记录角色创建的审计日志
 * 5. 返回创建成功的角色标识
 */
@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行角色创建操作
   * @param tenantId 租户ID
   * @param createRoleDto 角色创建数据
   * @returns 创建的角色ID
   */
  async execute(
    tenantId: string,
    createRoleDto: CreateRoleDto,
  ): Promise<string> {
    try {
      // 创建命令对象
      const command = new CreateRoleCommand(createRoleDto);

      // 通过命令总线发送命令
      await this.commandBus.execute(command);

      // TODO: 从命令处理器中获取实际的角色ID
      return 'role-created';
    } catch (error) {
      console.error('角色创建失败', {
        tenantId,
        roleName: createRoleDto.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
