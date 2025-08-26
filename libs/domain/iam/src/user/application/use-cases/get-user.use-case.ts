import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { UserResponseDto } from '../dtos/user-response.dto';
import { GetUserQuery } from '../queries/get-user.query';

/**
 * @interface IQueryBus
 * @description 查询总线接口
 */
export interface IQueryBus {
  execute<TQuery, TResult>(query: TQuery): Promise<TResult>;
}

/**
 * @class GetUserUseCase
 * @description 获取用户Use-Case，实现获取用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，提供统一的业务用例执行入口
 * 2. 作为CQRS模式的包装器，协调查询操作
 * 3. 负责业务逻辑编排和验证
 * 4. 支持依赖注入，便于测试和维护
 *
 * 功能与业务规则：
 * 1. 验证获取用户的输入参数
 * 2. 执行获取用户查询
 * 3. 返回标准化的用户响应
 * 4. 支持权限验证和数据隔离
 */
@Injectable()
export class GetUserUseCase implements IUseCase<string, UserResponseDto> {
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取用户Use-Case
   * @param userId 用户ID
   * @returns 用户响应DTO
   */
  async execute(userId: string): Promise<UserResponseDto> {
    // 1. 创建查询
    const query = new GetUserQuery(userId);

    // 2. 执行查询
    return this.queryBus.execute(query);
  }
}
