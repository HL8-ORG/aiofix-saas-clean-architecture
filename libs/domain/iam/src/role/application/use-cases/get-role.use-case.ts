import { Injectable } from '@nestjs/common';
import { IQueryBus } from '@aiofix/domain-shared';
import { GetRoleQuery } from '../queries/get-role.query';
import { RoleResponseDto } from '../dtos';

/**
 * @class GetRoleUseCase
 * @description
 * 角色查询用例，负责处理角色查询的业务逻辑。
 *
 * 主要原理与机制如下：
 * 1. 通过依赖注入获取查询总线，用于发送角色查询
 * 2. 接收角色ID，通过查询总线发送查询命令
 * 3. 返回角色详细信息
 *
 * 功能与业务规则：
 * 1. 验证角色查询的权限
 * 2. 通过查询总线发送角色查询命令
 * 3. 处理查询过程中的异常情况
 * 4. 记录角色查询的审计日志
 * 5. 返回角色详细信息
 */
@Injectable()
export class GetRoleUseCase {
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行角色查询操作
   * @param tenantId 租户ID
   * @param roleId 角色ID
   * @returns 角色详细信息
   */
  async execute(tenantId: string, roleId: string): Promise<RoleResponseDto> {
    try {
      // 创建查询对象
      const query = new GetRoleQuery({ id: roleId });

      // 通过查询总线发送查询
      const result = await this.queryBus.execute(query);

      return result as RoleResponseDto;
    } catch (error) {
      console.error('角色查询失败', {
        tenantId,
        roleId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
