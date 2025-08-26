import { Injectable } from '@nestjs/common';
import { IQueryHandler, Uuid } from '@aiofix/domain-shared';
import { GetTenantQuery } from '../get-tenant.query';
import { TenantRepository } from '../../../domain/repositories/tenant-repository.interface';
import { TenantResponseDto } from '../../dtos/tenant-response.dto';

/**
 * @class GetTenantHandler
 * @description 获取租户查询处理器，负责处理获取单个租户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetTenantQuery查询
 * 2. 使用依赖注入获取租户仓储
 * 3. 执行租户查询的业务逻辑
 * 4. 返回租户响应DTO
 *
 * 功能与业务规则：
 * 1. 验证租户ID的有效性
 * 2. 查询租户详细信息
 * 3. 转换为响应DTO格式
 * 4. 处理租户不存在的情况
 */
@Injectable()
export class GetTenantHandler
  implements IQueryHandler<GetTenantQuery, TenantResponseDto>
{
  /**
   * @constructor
   * @description 构造函数
   * @param tenantRepository 租户仓储
   */
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method execute
   * @description 执行获取租户查询
   * @param query 获取租户查询
   * @returns 租户响应DTO
   */
  async execute(query: GetTenantQuery): Promise<TenantResponseDto> {
    try {
      // 1. 验证租户ID格式
      const tenantId = this.validateTenantId(query.tenantId);

      // 2. 查询租户
      const tenant = await this.findTenant(tenantId);

      // 3. 转换为响应DTO
      const responseDto = TenantResponseDto.fromEntity(tenant);

      // 4. 如果需要统计信息，则添加统计信息
      if (query.includeStatistics) {
        responseDto.statistics = await this.getTenantStatistics(tenantId);
      }

      return responseDto;
    } catch (error) {
      // 记录错误日志
      console.error('获取租户失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateTenantId
   * @description 验证租户ID格式
   * @param tenantId 租户ID字符串
   * @returns 租户ID的Uuid对象
   * @throws {Error} 如果租户ID格式无效
   */
  private validateTenantId(tenantId: string): Uuid {
    try {
      return Uuid.fromString(tenantId);
    } catch (error) {
      throw new Error(`无效的租户ID格式: ${tenantId}`);
    }
  }

  /**
   * @method findTenant
   * @description 查找租户
   * @param tenantId 租户ID
   * @returns 租户实体
   * @throws {Error} 如果租户不存在
   */
  private async findTenant(tenantId: Uuid): Promise<any> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error(`租户 '${tenantId.value}' 不存在`);
    }
    return tenant;
  }

  /**
   * @method getTenantStatistics
   * @description 获取租户统计信息
   * @param tenantId 租户ID
   * @returns 租户统计信息
   */
  private async getTenantStatistics(tenantId: Uuid): Promise<{
    totalUsers: number;
    totalOrganizations: number;
    totalDepartments: number;
    activeUsers: number;
  }> {
    // TODO: 实现租户统计信息查询
    // 这里需要注入用户仓储、组织仓储等来获取统计数据
    return {
      totalUsers: 0,
      totalOrganizations: 0,
      totalDepartments: 0,
      activeUsers: 0,
    };
  }
}
