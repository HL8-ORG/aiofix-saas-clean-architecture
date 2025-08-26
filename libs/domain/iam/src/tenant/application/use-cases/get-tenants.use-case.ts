import { Injectable } from '@nestjs/common';
import { IUseCase, IQueryBus } from '@aiofix/domain-shared';
import { GetTenantsDto } from '../dtos/get-tenants.dto';
import { TenantResponseDto, PaginatedResponseDto } from '../dtos';
import { GetTenantsQuery } from '../queries/get-tenants.query';

/**
 * @class GetTenantsUseCase
 * @description 获取租户列表用例，负责租户列表查询的业务流程编排
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，定义租户列表查询的业务用例
 * 2. 使用依赖注入获取查询总线
 * 3. 协调查询的执行，实现业务流程编排
 * 4. 支持分页、过滤、排序等查询功能
 *
 * 功能与业务规则：
 * 1. 接收租户列表查询的输入参数
 * 2. 执行业务验证和规则检查
 * 3. 查询租户列表信息
 * 4. 返回分页的租户响应数据
 */
@Injectable()
export class GetTenantsUseCase
  implements IUseCase<GetTenantsDto, PaginatedResponseDto<TenantResponseDto>>
{
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取租户列表用例
   * @param dto 获取租户列表DTO
   * @returns 分页的租户响应DTO
   */
  async execute(dto: GetTenantsDto): Promise<PaginatedResponseDto<TenantResponseDto>> {
    try {
      // 1. 业务验证
      await this.validateBusinessRules(dto);

      // 2. 创建查询
      const query = new GetTenantsQuery(dto);

      // 3. 执行查询
      const tenantsResponse = await this.queryBus.execute<GetTenantsQuery, PaginatedResponseDto<TenantResponseDto>>(query);

      return tenantsResponse;
    } catch (error) {
      // 记录错误日志
      console.error('获取租户列表用例执行失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param dto 获取租户列表DTO
   * @throws {Error} 如果业务规则验证失败
   */
  private async validateBusinessRules(dto: GetTenantsDto): Promise<void> {
    // 验证分页参数
    if (dto.page && dto.page < 1) {
      throw new Error('页码必须大于0');
    }

    if (dto.limit && (dto.limit < 1 || dto.limit > 100)) {
      throw new Error('每页数量必须在1-100之间');
    }

    // 验证状态过滤
    if (dto.status) {
      const validStatuses = ['pending', 'active', 'suspended', 'cancelled'];
      if (!validStatuses.includes(dto.status)) {
        throw new Error('无效的租户状态');
      }
    }

    // 验证套餐类型过滤
    if (dto.plan) {
      const validPlans = ['basic', 'standard', 'premium', 'enterprise'];
      if (!validPlans.includes(dto.plan)) {
        throw new Error('无效的套餐类型');
      }
    }

    // 验证排序字段
    if (dto.sortBy) {
      const validSortFields = ['name', 'code', 'status', 'plan', 'createdAt', 'updatedAt'];
      if (!validSortFields.includes(dto.sortBy)) {
        throw new Error('无效的排序字段');
      }
    }

    // 验证排序方向
    if (dto.sortOrder && !['ASC', 'DESC'].includes(dto.sortOrder)) {
      throw new Error('无效的排序方向');
    }

    // 验证搜索关键词长度
    if (dto.search && dto.search.length > 100) {
      throw new Error('搜索关键词不能超过100个字符');
    }
  }
}
