import { Injectable } from '@nestjs/common';
import { IUseCase, IQueryBus } from '@aiofix/domain-shared';
import { TenantResponseDto } from '../dtos/tenant-response.dto';
import { GetTenantQuery } from '../queries/get-tenant.query';

/**
 * @class GetTenantUseCase
 * @description 获取租户用例，负责租户查询的业务流程编排
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，定义租户查询的业务用例
 * 2. 使用依赖注入获取查询总线
 * 3. 协调查询的执行，实现业务流程编排
 * 4. 支持租户详细信息的获取
 *
 * 功能与业务规则：
 * 1. 接收租户查询的输入参数
 * 2. 执行业务验证和规则检查
 * 3. 查询租户信息
 * 4. 返回租户响应数据
 */
@Injectable()
export class GetTenantUseCase
  implements IUseCase<{ tenantId: string; includeStatistics?: boolean }, TenantResponseDto>
{
  /**
   * @constructor
   * @description 构造函数
   * @param queryBus 查询总线
   */
  constructor(private readonly queryBus: IQueryBus) {}

  /**
   * @method execute
   * @description 执行获取租户用例
   * @param input 输入参数，包含租户ID和是否包含统计信息
   * @returns 租户响应DTO
   */
  async execute(
    input: { tenantId: string; includeStatistics?: boolean },
  ): Promise<TenantResponseDto> {
    try {
      // 1. 业务验证
      await this.validateBusinessRules(input);

      // 2. 创建查询
      const query = new GetTenantQuery(
        input.tenantId,
        input.includeStatistics || false,
      );

      // 3. 执行查询
      const tenantResponse = await this.queryBus.execute<GetTenantQuery, TenantResponseDto>(query);

      return tenantResponse;
    } catch (error) {
      // 记录错误日志
      console.error('获取租户用例执行失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param input 获取租户输入参数
   * @throws {Error} 如果业务规则验证失败
   */
  private async validateBusinessRules(input: {
    tenantId: string;
    includeStatistics?: boolean;
  }): Promise<void> {
    // 验证租户ID
    if (!input.tenantId || input.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    // 验证租户ID格式
    if (!this.isValidUuid(input.tenantId)) {
      throw new Error('租户ID格式无效');
    }
  }

  /**
   * @method isValidUuid
   * @description 验证UUID格式
   * @param uuid UUID字符串
   * @returns 是否有效
   */
  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
