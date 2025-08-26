import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { UpdateTenantCommand } from '../update-tenant.command';
import { TenantRepository } from '../../../domain/repositories/tenant-repository.interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

/**
 * @class UpdateTenantHandler
 * @description 更新租户命令处理器，负责处理更新租户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理UpdateTenantCommand命令
 * 2. 使用依赖注入获取租户仓储
 * 3. 执行租户更新的业务逻辑和验证
 * 4. 支持租户信息的部分更新
 *
 * 功能与业务规则：
 * 1. 验证租户是否存在
 * 2. 更新租户的基本信息
 * 3. 更新租户的状态和配置
 * 4. 返回更新后的租户ID
 */
@Injectable()
export class UpdateTenantHandler
  implements ICommandHandler<UpdateTenantCommand, string>
{
  /**
   * @constructor
   * @description 构造函数
   * @param tenantRepository 租户仓储
   */
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method execute
   * @description 执行更新租户命令
   * @param command 更新租户命令
   * @returns 更新后的租户ID
   */
  async execute(command: UpdateTenantCommand): Promise<string> {
    try {
      // 1. 查找租户
      const tenant = await this.findTenant(command.tenantId);

      // 2. 更新租户基本信息
      if (command.name) {
        tenant.updateName(command.name);
      }

      if (command.description !== undefined) {
        tenant.updateDescription(command.description);
      }

      if (command.adminEmail) {
        tenant.updateContactInfo(command.adminEmail);
      }

      // 3. 更新租户状态
      if (command.status) {
        await this.updateTenantStatus(tenant, command.status);
      }

      // 4. 更新租户设置
      if (command.settings) {
        tenant.updateSettings(command.settings);
      }

      // 5. 保存更新后的租户
      await this.tenantRepository.save(tenant);

      // 6. 返回租户ID
      return tenant.id.value;
    } catch (error) {
      // 记录错误日志
      console.error('更新租户失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method findTenant
   * @description 查找租户
   * @param tenantId 租户ID
   * @returns 租户实体
   * @throws {Error} 如果租户不存在
   */
  private async findTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(
      Uuid.fromString(tenantId),
    );
    if (!tenant) {
      throw new Error(`租户 '${tenantId}' 不存在`);
    }
    return tenant;
  }

  /**
   * @method updateTenantStatus
   * @description 更新租户状态
   * @param tenant 租户实体
   * @param status 新状态
   */
  private async updateTenantStatus(
    tenant: Tenant,
    status: string,
  ): Promise<void> {
    switch (status) {
      case 'active':
        tenant.activate();
        break;
      case 'suspended':
        tenant.suspend();
        break;
      case 'disabled':
        tenant.disable();
        break;
      default:
        throw new Error(`无效的租户状态: ${status}`);
    }
  }
}
