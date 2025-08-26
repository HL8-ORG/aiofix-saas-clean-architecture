import { Injectable } from '@nestjs/common';
import { IQueryBus } from '@aiofix/domain-shared';
import { GetOrganizationQuery } from '../queries/get-organization.query';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';

/**
 * @class GetOrganizationUseCase
 * @description 获取组织用例
 *
 * 主要原理与机制：
 * 1. 实现应用层的业务用例逻辑
 * 2. 使用查询总线发送获取组织查询
 * 3. 协调查询处理器执行具体业务逻辑
 * 4. 提供数据访问和错误处理
 *
 * 功能与业务规则：
 * 1. 接收获取组织请求
 * 2. 验证查询参数
 * 3. 发送查询请求
 * 4. 返回组织信息
 * 5. 处理业务异常
 */
@Injectable()
export class GetOrganizationUseCase {
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取组织用例
   * @param id 组织ID
   * @param includeChildren 是否包含子组织
   * @param includeMembers 是否包含成员
   * @param includeStatistics 是否包含统计信息
   * @returns {Promise<OrganizationResponseDto>} 组织响应DTO
   */
  async execute(
    id: string,
    includeChildren = false,
    includeMembers = false,
    includeStatistics = false,
  ): Promise<OrganizationResponseDto> {
    try {
      // 1. 创建查询
      const query = new GetOrganizationQuery({
        id,
        includeChildren,
        includeMembers,
        includeStatistics,
      });

      // 2. 发送查询并等待结果
      const organization = await this.queryBus.execute(query);

      // 3. 返回组织信息
      return organization as OrganizationResponseDto;
    } catch (error) {
      console.error('获取组织用例执行失败:', (error as Error).message);
      throw error;
    }
  }
}
