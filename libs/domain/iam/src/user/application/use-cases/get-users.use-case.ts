import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { GetUsersDto } from '../dtos/get-users.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { GetUsersQuery } from '../queries/get-users.query';

/**
 * @interface IQueryBus
 * @description 查询总线接口
 */
export interface IQueryBus {
  execute<TQuery, TResult>(query: TQuery): Promise<TResult>;
}

/**
 * @class GetUsersUseCase
 * @description 获取用户列表Use-Case，实现获取用户列表的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，提供统一的业务用例执行入口
 * 2. 作为CQRS模式的包装器，协调查询操作
 * 3. 负责业务逻辑编排和验证
 * 4. 支持依赖注入，便于测试和维护
 *
 * 功能与业务规则：
 * 1. 验证获取用户列表的输入参数
 * 2. 执行获取用户列表查询
 * 3. 返回标准化的分页响应
 * 4. 支持权限验证和数据隔离
 */
@Injectable()
export class GetUsersUseCase
  implements IUseCase<GetUsersDto, PaginatedResponseDto<UserResponseDto>>
{
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取用户列表Use-Case
   * @param input 获取用户列表DTO
   * @returns 分页用户响应DTO
   */
  async execute(
    input: GetUsersDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    // 1. 创建查询
    const query = new GetUsersQuery(input);

    // 2. 执行查询
    return this.queryBus.execute(query);
  }
}
