import { Injectable } from '@nestjs/common';
import { IUseCase, ICommandBus } from '@aiofix/domain-shared';
import { DeleteTenantCommand } from '../commands/delete-tenant.command';

/**
 * @class DeleteTenantUseCase
 * @description 删除租户用例，负责租户删除的业务流程编排
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，定义租户删除的业务用例
 * 2. 使用依赖注入获取命令总线
 * 3. 协调命令的执行，实现业务流程编排
 * 4. 支持租户的软删除和硬删除
 *
 * 功能与业务规则：
 * 1. 接收删除租户的输入参数
 * 2. 执行业务验证和规则检查
 * 3. 删除租户命令并执行
 * 4. 返回删除操作结果
 */
@Injectable()
export class DeleteTenantUseCase
  implements IUseCase<{ tenantId: string; reason?: string; force?: boolean }, void>
{
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行删除租户用例
   * @param input 输入参数，包含租户ID、删除原因和是否强制删除
   * @param userId 执行用户ID
   * @param tenantId 所属租户ID
   */
  async execute(
    input: { tenantId: string; reason?: string; force?: boolean },
    userId?: string,
    commandTenantId?: string,
  ): Promise<void> {
    try {
      // 1. 业务验证
      await this.validateBusinessRules(input);

      // 2. 创建命令
      const command = new DeleteTenantCommand(
        input.tenantId,
        input.reason,
        input.force || false,
        userId,
        commandTenantId,
      );

      // 3. 执行命令（删除租户）
      await this.commandBus.execute<DeleteTenantCommand, void>(command);

      console.log(`租户 '${input.tenantId}' 删除用例执行成功`);
    } catch (error) {
      // 记录错误日志
      console.error('删除租户用例执行失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param input 删除租户输入参数
   * @throws {Error} 如果业务规则验证失败
   */
  private async validateBusinessRules(input: {
    tenantId: string;
    reason?: string;
    force?: boolean;
  }): Promise<void> {
    // 验证租户ID
    if (!input.tenantId || input.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    // 验证租户ID格式
    if (!this.isValidUuid(input.tenantId)) {
      throw new Error('租户ID格式无效');
    }

    // 验证删除原因（如果不是强制删除）
    if (!input.force && (!input.reason || input.reason.trim().length === 0)) {
      throw new Error('删除原因不能为空（非强制删除时）');
    }

    // 验证删除原因长度
    if (input.reason && input.reason.length > 500) {
      throw new Error('删除原因不能超过500个字符');
    }
  }

  /**
   * @method isValidUuid
   * @description 验证UUID格式
   * @param uuid UUID字符串
   * @returns 是否有效
   */
  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
