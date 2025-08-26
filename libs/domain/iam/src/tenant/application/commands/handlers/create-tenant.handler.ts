import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { CreateTenantCommand } from '../create-tenant.command';
import { TenantRepository } from '../../../domain/repositories/tenant-repository.interface';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TenantCode } from '../../../domain/value-objects/tenant-code.vo';
import { TenantStatus } from '../../../domain/entities/tenant.entity';

/**
 * @class CreateTenantHandler
 * @description 创建租户命令处理器，负责处理创建租户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理CreateTenantCommand命令
 * 2. 使用依赖注入获取租户仓储和事件总线
 * 3. 执行租户创建的业务逻辑和验证
 * 4. 发布租户创建事件
 *
 * 功能与业务规则：
 * 1. 验证租户代码的唯一性
 * 2. 创建租户实体并保存到仓储
 * 3. 发布租户创建事件
 * 4. 返回新创建的租户ID
 */
@Injectable()
export class CreateTenantHandler
  implements ICommandHandler<CreateTenantCommand, string>
{
  /**
   * @constructor
   * @description 构造函数
   * @param tenantRepository 租户仓储
   */
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method execute
   * @description 执行创建租户命令
   * @param command 创建租户命令
   * @returns 新创建的租户ID
   */
  async execute(command: CreateTenantCommand): Promise<string> {
    try {
      // 1. 验证租户代码唯一性
      await this.validateTenantCodeUniqueness(command.code);

      // 2. 创建租户代码值对象
      const tenantCode = new TenantCode(command.code);

      // 3. 创建租户实体
      const tenant = new Tenant(
        Uuid.generate(), // 生成新的UUID
        tenantCode,
        command.name,
        TenantStatus.PENDING, // 初始状态为待激活
        100, // 默认最大用户数
        10, // 默认最大组织数
        command.description,
        command.adminEmail,
        undefined, // contactPhone
        command.settings || {},
      );

      // 4. 保存租户到仓储
      await this.tenantRepository.save(tenant);

      // 5. 返回新创建的租户ID
      return tenant.id.value;
    } catch (error) {
      // 记录错误日志
      console.error('创建租户失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateTenantCodeUniqueness
   * @description 验证租户代码唯一性
   * @param code 租户代码
   * @throws {Error} 如果租户代码已存在
   */
  private async validateTenantCodeUniqueness(code: string): Promise<void> {
    const existingTenant = await this.tenantRepository.findByCode(code);
    if (existingTenant) {
      throw new Error(`租户代码 '${code}' 已存在`);
    }
  }
}
