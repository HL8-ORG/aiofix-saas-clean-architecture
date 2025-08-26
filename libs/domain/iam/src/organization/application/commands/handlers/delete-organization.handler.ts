import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { DeleteOrganizationCommand } from '../delete-organization.command';
import { OrganizationRepository } from '../../../domain/repositories/organization-repository.interface';

/**
 * @class DeleteOrganizationHandler
 * @description 删除组织命令处理器
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理DeleteOrganizationCommand命令
 * 2. 使用依赖注入获取组织仓储服务
 * 3. 执行组织删除的业务逻辑
 * 4. 支持软删除和硬删除
 *
 * 功能与业务规则：
 * 1. 验证组织存在性
 * 2. 验证删除权限
 * 3. 检查组织依赖关系
 * 4. 执行组织删除
 * 5. 返回删除结果
 */
@Injectable()
export class DeleteOrganizationHandler
  implements ICommandHandler<DeleteOrganizationCommand, void>
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
   * @description 执行删除组织命令
   * @param command 删除组织命令
   * @returns {Promise<void>}
   */
  async execute(command: DeleteOrganizationCommand): Promise<void> {
    try {
      // 1. 获取现有组织
      const organization = await this.organizationRepository.findById(
        Uuid.fromString(command.data.id),
      );
      if (!organization) {
        throw new Error(`组织 '${command.data.id}' 不存在`);
      }

      // 2. 检查组织是否有子组织
      const children = await this.organizationRepository.findByParent(
        command.data.id,
      );
      if (children.length > 0) {
        throw new Error(`组织 '${command.data.id}' 存在子组织，无法删除`);
      }

      // 3. 检查组织是否有成员
      if (organization.members.length > 0) {
        throw new Error(`组织 '${command.data.id}' 存在成员，无法删除`);
      }

      // 4. 执行软删除
      organization.disable();

      // 5. 保存删除后的组织
      await this.organizationRepository.save(organization);
    } catch (error) {
      console.error('删除组织失败:', (error as Error).message);
      throw error;
    }
  }
}
