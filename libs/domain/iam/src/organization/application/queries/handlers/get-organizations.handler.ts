import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@aiofix/domain-shared';
import { GetOrganizationsQuery } from '../get-organizations.query';
import { OrganizationRepository } from '../../../domain/repositories/organization-repository.interface';
import { OrganizationResponseDto, PaginatedResponseDto } from '../../dtos';
import { Organization } from '../../../domain/entities/organization.entity';

/**
 * @class GetOrganizationsHandler
 * @description 获取组织列表查询处理器
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetOrganizationsQuery查询
 * 2. 使用依赖注入获取组织仓储服务
 * 3. 执行组织列表查询的业务逻辑
 * 4. 支持分页、过滤、排序
 *
 * 功能与业务规则：
 * 1. 构建查询条件
 * 2. 执行分页查询
 * 3. 加载关联数据
 * 4. 转换为响应DTO
 * 5. 返回分页结果
 */
@Injectable()
export class GetOrganizationsHandler
  implements
    IQueryHandler<
      GetOrganizationsQuery,
      PaginatedResponseDto<OrganizationResponseDto>
    >
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
   * @description 执行获取组织列表查询
   * @param query 获取组织列表查询
   * @returns {Promise<PaginatedResponseDto<OrganizationResponseDto>>} 分页响应DTO
   */
  async execute(
    query: GetOrganizationsQuery,
  ): Promise<PaginatedResponseDto<OrganizationResponseDto>> {
    try {
      // 1. 构建查询条件
      const _searchCriteria = this.buildSearchCriteria(
        query.data as Record<string, unknown>,
      );

      // 2. 执行分页查询
      const _page = query.data.page || 1;
      const _limit = query.data.limit || 10;
      const _offset = (_page - 1) * _limit;

      // TODO: 实现分页查询，目前使用简单查询
      let organizations: any[] = [];
      let total = 0;

      if (query.data.tenantId) {
        const result = await this.organizationRepository.findByTenant(
          query.data.tenantId,
        );
        organizations = Array.isArray(result) ? result : [];
      } else {
        const result = await this.organizationRepository.findAll();
        organizations = Array.isArray(result) ? result : [];
      }

      total = organizations.length;

      // 3. 转换为响应DTO
      const organizationDtos = OrganizationResponseDto.fromEntities(
        organizations as unknown as Organization[],
      );

      // 4. 添加统计信息（如果需要）
      if (query.data.includeStatistics) {
        await this.addStatisticsToOrganizations(organizationDtos);
      }

      // 5. 返回分页结果
      return PaginatedResponseDto.fromData(
        organizationDtos,
        _page,
        _limit,
        total,
      );
    } catch (error) {
      console.error('获取组织列表失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method buildSearchCriteria
   * @description 构建查询条件
   * @param data 查询数据
   * @returns 查询条件
   */
  private buildSearchCriteria(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const criteria: Record<string, unknown> = {};

    if (data.tenantId) {
      criteria.tenantId = data.tenantId;
    }

    if (data.parentId) {
      criteria.parentId = data.parentId;
    }

    if (data.status) {
      criteria.status = data.status;
    }

    if (data.type) {
      criteria.type = data.type;
    }

    if (data.managerId) {
      criteria.managerId = data.managerId;
    }

    if (data.search) {
      criteria.search = data.search;
    }

    return criteria;
  }

  /**
   * @method addStatisticsToOrganizations
   * @description 为组织添加统计信息
   * @param organizations 组织DTO列表
   */
  private async addStatisticsToOrganizations(
    organizations: OrganizationResponseDto[],
  ): Promise<void> {
    // TODO: 实现统计信息加载
    for (const organization of organizations) {
      organization.statistics = {
        userCount: 0,
        departmentCount: 0,
        roleCount: 0,
        projectCount: 0,
        storageUsed: 0,
        apiCallCount: 0,
      };
    }
  }
}
