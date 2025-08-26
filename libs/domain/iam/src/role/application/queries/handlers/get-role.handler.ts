import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoleQuery } from '../get-role.query';
import { RoleResponseDto } from '../../dtos';
import { Uuid } from '@aiofix/domain-shared';
import { RoleRepository } from '../../../domain/repositories/role-repository.interface';

/**
 * @class GetRoleHandler
 * @description
 * 角色查询处理器，负责处理获取单个角色的查询请求。
 *
 * 主要原理与机制如下：
 * 1. 实现IQueryHandler接口，处理GetRoleQuery类型的查询
 * 2. 通过依赖注入获取角色仓储接口，用于数据访问
 * 3. 将查询结果转换为RoleResponseDto格式返回
 *
 * 功能与业务规则：
 * 1. 根据角色ID查询角色信息
 * 2. 验证角色是否存在
 * 3. 返回标准化的角色响应数据
 */
@Injectable()
@QueryHandler(GetRoleQuery)
export class GetRoleHandler
  implements IQueryHandler<GetRoleQuery, RoleResponseDto>
{
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * @method execute
   * @description 执行角色查询操作
   * @param query 角色查询对象
   * @returns 角色响应DTO
   */
  async execute(query: GetRoleQuery): Promise<RoleResponseDto> {
    try {
      // 将字符串ID转换为Uuid对象
      const roleId = Uuid.fromString(query.data.id);

      // 从仓储中查询角色
      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        throw new Error(`角色不存在: ${query.data.id}`);
      }

      // 转换为响应DTO
      const responseDto = RoleResponseDto.fromEntity(role);

      return responseDto;
    } catch (error) {
      console.error('角色查询失败', {
        roleId: query.data.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
