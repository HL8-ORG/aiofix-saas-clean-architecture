import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@aiofix/domain-shared';
import { CreateOrganizationCommand } from '../create-organization.command';
import { OrganizationRepository } from '../../../domain/repositories/organization-repository.interface';
import {
  Organization,
  OrganizationType,
  OrganizationStatus,
} from '../../../domain/entities/organization.entity';
import { OrganizationCode } from '../../../domain/value-objects/organization-code.vo';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @class CreateOrganizationHandler
 * @description 创建组织命令处理器
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理CreateOrganizationCommand命令
 * 2. 使用依赖注入获取组织仓储服务
 * 3. 执行组织创建的业务逻辑
 * 4. 支持组织代码唯一性验证
 * 5. 支持组织层级关系管理
 *
 * 功能与业务规则：
 * 1. 验证组织代码在租户内的唯一性
 * 2. 创建组织实体并设置默认值
 * 3. 处理组织层级关系
 * 4. 保存组织到仓储
 * 5. 返回组织ID
 */
@Injectable()
export class CreateOrganizationHandler
  implements ICommandHandler<CreateOrganizationCommand, string>
{
  /**
   * @constructor
   * @description 构造函数
   * @param organizationRepository 组织仓储接口
   */
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * @method execute
   * @description 执行创建组织命令
   * @param command 创建组织命令
   * @returns {Promise<string>} 组织ID
   */
  async execute(command: CreateOrganizationCommand): Promise<string> {
    try {
      // 1. 验证组织代码唯一性
      await this.validateOrganizationCodeUniqueness(
        command.data.code,
        command.data.tenantId,
      );

      // 2. 验证父组织存在性（如果指定了父组织）
      if (command.data.parentId) {
        await this.validateParentOrganization(
          command.data.parentId,
          command.data.tenantId,
        );
      }

      // 3. 创建组织代码值对象
      const organizationCode = new OrganizationCode(command.data.code);

      // 4. 创建组织实体
      const organization = new Organization(
        Uuid.generate(),
        organizationCode,
        command.data.name,
        Uuid.fromString(command.data.tenantId),
        command.data.type || OrganizationType.DEPARTMENT,
        command.data.parentId
          ? Uuid.fromString(command.data.parentId)
          : undefined,
      );

      // 5. 设置组织描述
      if (command.data.description) {
        organization.updateDescription(command.data.description);
      }

      // 6. 设置管理员
      if (command.data.managerId) {
        // TODO: 实现管理员分配逻辑
        console.log(`设置管理员: ${command.data.managerId}`);
      }

      // 7. 设置联系信息
      if (command.data.contact) {
        organization.updateContact(command.data.contact);
      }

      // 8. 设置组织配置
      if (command.data.settings) {
        // TODO: 实现设置更新逻辑，需要处理类型转换
        console.log('设置组织配置:', command.data.settings);
      }

      // 9. 设置组织限制
      if (command.data.limits) {
        organization.updateLimits(command.data.limits);
      }

      // 10. 保存组织
      await this.organizationRepository.save(organization);

      // 11. 返回组织ID
      return organization.id.value;
    } catch (error) {
      console.error('创建组织失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateOrganizationCodeUniqueness
   * @description 验证组织代码在租户内的唯一性
   * @param code 组织代码
   * @param tenantId 租户ID
   */
  private async validateOrganizationCodeUniqueness(
    code: string,
    tenantId: string,
  ): Promise<void> {
    const existingOrganization = await this.organizationRepository.findByCode(
      code,
      tenantId,
    );
    if (existingOrganization) {
      throw new Error(`组织代码 '${code}' 在租户内已存在`);
    }
  }

  /**
   * @method validateParentOrganization
   * @description 验证父组织存在性
   * @param parentId 父组织ID
   * @param tenantId 租户ID
   */
  private async validateParentOrganization(
    parentId: string,
    _tenantId: string,
  ): Promise<void> {
    const parentOrganization = await this.organizationRepository.findById(
      Uuid.fromString(parentId),
    );
    if (!parentOrganization) {
      throw new Error(`父组织 '${parentId}' 不存在`);
    }
    if (parentOrganization.status !== OrganizationStatus.ACTIVE) {
      throw new Error(`父组织 '${parentId}' 状态异常，无法作为父组织`);
    }
  }
}
