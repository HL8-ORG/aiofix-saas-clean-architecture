import { Injectable } from '@nestjs/common';
import { IQueryBus } from '@aiofix/domain-shared';
import { GetOrganizationsQuery } from '../queries/get-organizations.query';
import { GetOrganizationsDto } from '../dtos/get-organizations.dto';
import { OrganizationResponseDto, PaginatedResponseDto } from '../dtos';

/**
 * @class GetOrganizationsUseCase
 * @description 获取组织列表用例
 *
 * 主要原理与机制：
 * 1. 实现应用层的业务用例逻辑
 * 2. 使用查询总线发送获取组织列表查询
 * 3. 协调查询处理器执行具体业务逻辑
 * 4. 提供数据访问和错误处理
 *
 * 功能与业务规则：
 * 1. 接收获取组织列表请求
 * 2. 验证查询参数
 * 3. 发送查询请求
 * 4. 返回分页组织信息
 * 5. 处理业务异常
 */
@Injectable()
export class GetOrganizationsUseCase {
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取组织列表用例
   * @param getOrganizationsDto 获取组织列表DTO
   * @returns {Promise<PaginatedResponseDto<OrganizationResponseDto>>} 分页响应DTO
   */
  async execute(
    getOrganizationsDto: GetOrganizationsDto,
  ): Promise<PaginatedResponseDto<OrganizationResponseDto>> {
    try {
      // 1. 创建查询
      const query = new GetOrganizationsQuery(getOrganizationsDto);

      // 2. 发送查询并等待结果
      const organizations = await this.queryBus.execute(query);

      // 3. 返回分页组织信息
      return organizations as PaginatedResponseDto<OrganizationResponseDto>;
    } catch (error) {
      console.error('获取组织列表用例执行失败:', (error as Error).message);
      throw error;
    }
  }
}
