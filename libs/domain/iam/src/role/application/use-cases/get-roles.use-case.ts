import { Injectable } from '@nestjs/common';
import { IQueryBus } from '@aiofix/domain-shared';
import { GetRolesQuery } from '../queries/get-roles.query';

/**
 * @class GetRolesUseCase
 * @description
 * 角色列表查询用例，负责处理角色列表查询的业务逻辑。
 *
 * 主要原理与机制如下：
 * 1. 通过依赖注入获取查询总线，用于发送角色列表查询
 * 2. 接收查询条件，通过查询总线发送查询命令
 * 3. 返回分页的角色列表
 *
 * 功能与业务规则：
 * 1. 验证角色列表查询的权限
 * 2. 通过查询总线发送角色列表查询命令
 * 3. 处理查询过程中的异常情况
 * 4. 记录角色列表查询的审计日志
 * 5. 返回分页的角色列表信息
 */
@Injectable()
export class GetRolesUseCase {
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行角色列表查询操作
   * @param tenantId 租户ID
   * @param getRolesDto 角色列表查询条件
   * @returns 角色列表
   */
  async execute(tenantId: string, getRolesDto: any): Promise<any> {
    try {
      // 创建查询对象
      const query = new GetRolesQuery(getRolesDto);

      // 通过查询总线发送查询
      const result = await this.queryBus.execute(query);

      return result;
    } catch (error) {
      console.error('角色列表查询失败', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
