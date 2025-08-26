import { Injectable } from '@nestjs/common';
import { GetUsersQuery } from '../get-users.query';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { IQueryHandler } from '@aiofix/domain-shared';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { PaginatedResponseDto } from '../../dtos/paginated-response.dto';

/**
 * @class GetUsersHandler
 * @description 获取用户列表查询处理器，实现获取用户列表的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetUsersQuery
 * 2. 支持分页、过滤、排序
 * 3. 从仓储中获取用户列表
 * 4. 转换为响应DTO
 * 5. 支持缓存和性能优化
 *
 * 功能与业务规则：
 * 1. 根据条件获取用户列表
 * 2. 分页和排序支持
 * 3. 数据权限验证
 * 4. 响应数据转换
 */
@Injectable()
export class GetUsersHandler
  implements IQueryHandler<GetUsersQuery, PaginatedResponseDto<UserResponseDto>>
{
  /**
   * @constructor
   * @description 构造函数
   * @param userRepository 用户仓储
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行获取用户列表查询
   * @param query 获取用户列表查询
   * @returns 分页用户响应DTO
   */
  async execute(
    query: GetUsersQuery,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    // 1. 获取用户列表
    const result = await this.userRepository.findByOrganization(
      query.organizationId || '',
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: (query.sortOrder?.toLowerCase() as 'asc' | 'desc') || 'desc',
      },
    );

    // 2. 转换为响应DTO
    const userDtos = result.data.map(user => UserResponseDto.fromEntity(user));

    // 3. 返回分页结果
    return {
      data: userDtos,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
        hasNextPage: query.page < Math.ceil(result.total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    };
  }
}
