import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { DeleteTenantCommand } from '../delete-tenant.command';
import { TenantRepository } from '../../../domain/repositories/tenant-repository.interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

/**
 * @class DeleteTenantHandler
 * @description 删除租户命令处理器，负责处理删除租户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理DeleteTenantCommand命令
 * 2. 使用依赖注入获取租户仓储
 * 3. 执行租户删除的业务逻辑和验证
 * 4. 支持软删除和硬删除两种模式
 *
 * 功能与业务规则：
 * 1. 验证租户是否存在
 * 2. 检查租户是否可以删除
 * 3. 执行软删除或硬删除
 * 4. 记录删除原因和审计信息
 */
@Injectable()
export class DeleteTenantHandler
  implements ICommandHandler<DeleteTenantCommand, void>
{
  /**
   * @constructor
   * @description 构造函数
   * @param tenantRepository 租户仓储
   */
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method execute
   * @description 执行删除租户命令
   * @param command 删除租户命令
   */
  async execute(command: DeleteTenantCommand): Promise<void> {
    try {
      // 1. 查找租户
      const tenant = await this.findTenant(command.tenantId);

      // 2. 验证租户是否可以删除
      await this.validateTenantDeletion(tenant);

      // 3. 执行删除操作
      if (command.force) {
        // 硬删除
        await this.hardDeleteTenant(tenant);
      } else {
        // 软删除
        await this.softDeleteTenant(tenant, command.reason);
      }

      console.log(`租户 '${command.tenantId}' 删除成功`);
    } catch (error) {
      // 记录错误日志
      console.error('删除租户失败:', (error as Error).message);
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
   * @method validateTenantDeletion
   * @description 验证租户是否可以删除
   * @param tenant 租户实体
   * @throws {Error} 如果租户不能删除
   */
  private async validateTenantDeletion(tenant: Tenant): Promise<void> {
    // 检查租户状态
    if (tenant.isActive()) {
      throw new Error('无法删除激活状态的租户，请先停用租户');
    }

    // TODO: 检查租户下是否有用户、组织等关联数据
    // const hasUsers = await this.userRepository.countByTenant(tenant.id) > 0;
    // if (hasUsers) {
    //   throw new Error('租户下还有用户数据，无法删除');
    // }

    // const hasOrganizations = await this.organizationRepository.countByTenant(tenant.id) > 0;
    // if (hasOrganizations) {
    //   throw new Error('租户下还有组织数据，无法删除');
    // }
  }

  /**
   * @method softDeleteTenant
   * @description 软删除租户
   * @param tenant 租户实体
   * @param _reason 删除原因（暂未使用）
   */
  private async softDeleteTenant(
    tenant: Tenant,
    _reason?: string,
  ): Promise<void> {
    // 标记租户为已删除状态（使用disable方法）
    tenant.disable();

    // 保存更新后的租户
    await this.tenantRepository.save(tenant);
  }

  /**
   * @method hardDeleteTenant
   * @description 硬删除租户
   * @param tenant 租户实体
   */
  private async hardDeleteTenant(tenant: Tenant): Promise<void> {
    // 直接从仓储中删除租户
    await this.tenantRepository.delete(tenant.id);
  }
}
