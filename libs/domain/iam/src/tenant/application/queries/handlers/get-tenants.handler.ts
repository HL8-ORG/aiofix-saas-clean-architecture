import { Injectable } from '@nestjs/common';
import { IQueryHandler } from '@aiofix/domain-shared';
import { GetTenantsQuery } from '../get-tenants.query';
import { TenantRepository } from '../../../domain/repositories/tenant-repository.interface';
import { TenantResponseDto, PaginatedResponseDto } from '../../dtos';
import { Tenant } from '../../../domain/entities/tenant.entity';

/**
 * @class GetTenantsHandler
 * @description 获取租户列表查询处理器，负责处理获取租户列表的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetTenantsQuery查询
 * 2. 使用依赖注入获取租户仓储
 * 3. 执行租户列表查询的业务逻辑
 * 4. 支持分页、过滤、排序功能
 *
 * 功能与业务规则：
 * 1. 支持分页查询，限制每页数量
 * 2. 支持按状态、套餐类型等条件过滤
 * 3. 支持按名称、代码等字段搜索
 * 4. 支持按创建时间、更新时间等字段排序
 * 5. 返回分页响应DTO
 */
@Injectable()
export class GetTenantsHandler
  implements
    IQueryHandler<GetTenantsQuery, PaginatedResponseDto<TenantResponseDto>>
{
  /**
   * @constructor
   * @description 构造函数
   * @param tenantRepository 租户仓储
   */
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method execute
   * @description 执行获取租户列表查询
   * @param query 获取租户列表查询
   * @returns 分页的租户响应DTO
   */
  async execute(
    query: GetTenantsQuery,
  ): Promise<PaginatedResponseDto<TenantResponseDto>> {
    try {
      // 1. 构建查询条件
      const _searchCriteria = this.buildSearchCriteria(query);

      // 2. 查询租户列表
      // TODO: 实现分页查询，目前使用简单查询
      let tenants: Tenant[] = [];
      let total = 0;

      if (query.status) {
        tenants = await this.tenantRepository.findByStatus(query.status);
      } else {
        // 获取所有租户（这里需要实现分页）
        tenants = await this.tenantRepository.findActiveTenants();
      }

      total = tenants.length;

      // 3. 转换为响应DTO
      const tenantDtos = TenantResponseDto.fromEntities(tenants);

      // 4. 如果需要统计信息，则添加统计信息
      if (query.includeStatistics) {
        await this.addStatisticsToTenants(tenantDtos);
      }

      // 5. 返回分页响应
      return PaginatedResponseDto.fromData(
        tenantDtos,
        query.page,
        query.limit,
        total,
      );
    } catch (error) {
      // 记录错误日志
      console.error('获取租户列表失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method buildSearchCriteria
   * @description 构建搜索条件
   * @param query 查询参数
   * @returns 搜索条件对象
   */
  private buildSearchCriteria(query: GetTenantsQuery): Record<string, unknown> {
    const criteria: Record<string, unknown> = {};

    // 添加状态过滤
    if (query.status) {
      criteria.status = query.status;
    }

    // 添加套餐类型过滤
    if (query.plan) {
      criteria.plan = query.plan;
    }

    // 添加搜索关键词
    if (query.search) {
      criteria.search = query.search;
    }

    return criteria;
  }

  /**
   * @method addStatisticsToTenants
   * @description 为租户列表添加统计信息
   * @param tenants 租户响应DTO数组
   */
  private async addStatisticsToTenants(
    tenants: TenantResponseDto[],
  ): Promise<void> {
    // TODO: 实现批量获取租户统计信息
    // 这里需要注入用户仓储、组织仓储等来获取统计数据
    for (const tenant of tenants) {
      tenant.statistics = {
        totalUsers: 0,
        totalOrganizations: 0,
        totalDepartments: 0,
        activeUsers: 0,
      };
    }
  }
}
