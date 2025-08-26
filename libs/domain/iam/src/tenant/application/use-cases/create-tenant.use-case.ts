import { Injectable } from '@nestjs/common';
import { IUseCase, ICommandBus, IQueryBus } from '@aiofix/domain-shared';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { TenantResponseDto } from '../dtos/tenant-response.dto';
import { CreateTenantCommand } from '../commands/create-tenant.command';
import { GetTenantQuery } from '../queries/get-tenant.query';

/**
 * @class CreateTenantUseCase
 * @description 创建租户用例，负责租户创建的业务流程编排
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，定义租户创建的业务用例
 * 2. 使用依赖注入获取命令总线和查询总线
 * 3. 协调命令和查询的执行，实现业务流程编排
 * 4. 支持租户注册和初始化的完整流程
 *
 * 功能与业务规则：
 * 1. 接收创建租户的输入参数
 * 2. 执行业务验证和规则检查
 * 3. 创建租户命令并执行
 * 4. 查询新创建的租户信息
 * 5. 返回租户响应数据
 */
@Injectable()
export class CreateTenantUseCase
  implements IUseCase<CreateTenantDto, TenantResponseDto>
{
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   * @param queryBus 查询总线
   */
  constructor(
    private readonly commandBus: ICommandBus,
    private readonly queryBus: IQueryBus,
  ) {}

  /**
   * @method execute
   * @description 执行创建租户用例
   * @param dto 创建租户DTO
   * @param userId 执行用户ID
   * @param tenantId 所属租户ID
   * @returns 租户响应DTO
   */
  async execute(
    dto: CreateTenantDto,
    userId?: string,
    tenantId?: string,
  ): Promise<TenantResponseDto> {
    try {
      // 1. 业务验证
      await this.validateBusinessRules(dto);

      // 2. 创建命令
      const command = new CreateTenantCommand(dto, userId, tenantId);

      // 3. 执行命令（创建租户）
      const newTenantId = await this.commandBus.execute<
        CreateTenantCommand,
        string
      >(command);

      // 4. 查询新创建的租户
      const query = new GetTenantQuery(newTenantId, true); // 包含统计信息
      const tenantResponse = await this.queryBus.execute<
        GetTenantQuery,
        TenantResponseDto
      >(query);

      return tenantResponse;
    } catch (error) {
      // 记录错误日志
      console.error('创建租户用例执行失败:', (error as Error).message);
      throw error;
    }
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param dto 创建租户DTO
   * @throws {Error} 如果业务规则验证失败
   */
  private async validateBusinessRules(dto: CreateTenantDto): Promise<void> {
    // 验证租户名称
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('租户名称不能为空');
    }

    if (dto.name.length > 100) {
      throw new Error('租户名称不能超过100个字符');
    }

    // 验证租户代码
    if (!dto.code || dto.code.trim().length === 0) {
      throw new Error('租户代码不能为空');
    }

    if (dto.code.length > 50) {
      throw new Error('租户代码不能超过50个字符');
    }

    // 验证邮箱格式
    if (!dto.adminEmail || !this.isValidEmail(dto.adminEmail)) {
      throw new Error('管理员邮箱格式无效');
    }

    // 验证套餐类型
    const validPlans = ['basic', 'standard', 'premium', 'enterprise'];
    if (!validPlans.includes(dto.plan)) {
      throw new Error('无效的套餐类型');
    }
  }

  /**
   * @method isValidEmail
   * @description 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否有效
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
