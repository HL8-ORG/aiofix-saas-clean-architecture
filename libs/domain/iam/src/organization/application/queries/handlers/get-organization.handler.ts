import { Injectable } from '@nestjs/common';
import { IQueryHandler, Uuid } from '@aiofix/domain-shared';
import { GetOrganizationQuery } from '../get-organization.query';
import { OrganizationRepository } from '../../../domain/repositories/organization-repository.interface';
import { OrganizationResponseDto } from '../../dtos/organization-response.dto';

/**
 * @class GetOrganizationHandler
 * @description 获取组织查询处理器
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetOrganizationQuery查询
 * 2. 使用依赖注入获取组织仓储服务
 * 3. 执行组织查询的业务逻辑
 * 4. 支持关联数据查询
 *
 * 功能与业务规则：
 * 1. 根据ID查询组织
 * 2. 验证组织存在性
 * 3. 加载关联数据
 * 4. 转换为响应DTO
 * 5. 返回组织信息
 */
@Injectable()
export class GetOrganizationHandler
  implements IQueryHandler<GetOrganizationQuery, OrganizationResponseDto>
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
   * @description 执行获取组织查询
   * @param query 获取组织查询
   * @returns {Promise<OrganizationResponseDto>} 组织响应DTO
   */
  async execute(query: GetOrganizationQuery): Promise<OrganizationResponseDto> {
    try {
      // 1. 根据ID查询组织
      const organization = await this.organizationRepository.findById(
        Uuid.fromString(query.data.id),
      );
      if (!organization) {
        throw new Error(`组织 '${query.data.id}' 不存在`);
      }

      // 2. 加载关联数据（如果需要）
      if (query.data.includeChildren) {
        // TODO: 加载子组织信息
      }

      if (query.data.includeMembers) {
        // TODO: 加载成员信息
      }

      if (query.data.includeStatistics) {
        // TODO: 加载统计信息
      }

      // 3. 转换为响应DTO
      const responseDto = OrganizationResponseDto.fromEntity(organization);

      // 4. 添加统计信息（如果需要）
      if (query.data.includeStatistics) {
        responseDto.statistics = {
          userCount: 0, // TODO: 从用户服务获取
          departmentCount: 0, // TODO: 从部门服务获取
          roleCount: 0, // TODO: 从角色服务获取
          projectCount: 0, // TODO: 从项目服务获取
          storageUsed: 0, // TODO: 从存储服务获取
          apiCallCount: 0, // TODO: 从API服务获取
        };
      }

      return responseDto;
    } catch (error) {
      console.error('获取组织失败:', (error as Error).message);
      throw error;
    }
  }
}
