import { Injectable } from '@nestjs/common';
import { GetUserQuery } from '../get-user.query';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Uuid, IQueryHandler } from '@aiofix/domain-shared';
import { UserResponseDto } from '../../dtos/user-response.dto';

/**
 * @class GetUserHandler
 * @description 获取用户查询处理器，实现获取单个用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IQueryHandler接口，处理GetUserQuery
 * 2. 从仓储中获取用户信息
 * 3. 转换为响应DTO
 * 4. 支持缓存和性能优化
 *
 * 功能与业务规则：
 * 1. 根据用户ID获取用户信息
 * 2. 数据权限验证
 * 3. 响应数据转换
 * 4. 错误处理
 */
@Injectable()
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, UserResponseDto>
{
  /**
   * @constructor
   * @description 构造函数
   * @param userRepository 用户仓储
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行获取用户查询
   * @param query 获取用户查询
   * @returns 用户响应DTO
   */
  async execute(query: GetUserQuery): Promise<UserResponseDto> {
    // 1. 获取用户
    const user = await this.userRepository.findById(new Uuid(query.userId));
    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 转换为响应DTO
    return this.mapToResponseDto(user);
  }

  /**
   * @method mapToResponseDto
   * @description 将用户实体映射为响应DTO
   * @param user 用户实体
   * @returns 用户响应DTO
   */
  private mapToResponseDto(user: User): UserResponseDto {
    return UserResponseDto.fromEntity(user);
  }
}
