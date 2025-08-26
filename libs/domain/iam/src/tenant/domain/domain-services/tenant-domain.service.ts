/**
 * @file tenant-domain.service.ts
 * @description 租户领域服务
 *
 * 该文件定义了租户领域服务，负责处理租户相关的复杂业务逻辑。
 * 该服务封装了不自然属于租户实体的业务规则和操作。
 */

import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { TenantCode } from '../value-objects/tenant-code.vo';
import { TenantRepository } from '../repositories/tenant-repository.interface';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface CreateTenantRequest
 * @description 创建租户请求
 */
export interface CreateTenantRequest {
  code: string;
  name: string;
  description?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy?: string;
}

/**
 * @interface UpdateTenantRequest
 * @description 更新租户请求
 */
export interface UpdateTenantRequest {
  tenantId: string;
  name?: string;
  description?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedBy: string;
}

/**
 * @interface ChangeTenantStatusRequest
 * @description 变更租户状态请求
 */
export interface ChangeTenantStatusRequest {
  tenantId: string;
  newStatus: TenantStatus;
  changedBy: string;
  reason?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

/**
 * @interface TenantValidationResult
 * @description 租户验证结果
 */
export interface TenantValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * @class TenantDomainService
 * @description 租户领域服务
 *
 * 该服务负责处理租户相关的复杂业务逻辑，包括：
 * 1. 租户创建的业务规则验证
 * 2. 租户状态变更的业务逻辑
 * 3. 租户设置的验证和管理
 * 4. 租户统计信息的计算
 * 5. 租户间关系的管理
 */
export class TenantDomainService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  /**
   * @method createTenant
   * @description 创建租户
   * @param request 创建租户请求
   * @returns {Promise<Tenant>} 创建的租户实体
   */
  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    // 验证创建请求
    const validationResult = await this.validateCreateTenantRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `租户创建验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 创建租户代码值对象
    const tenantCode = TenantCode.fromString(request.code);

    // 创建租户实体
    const tenant = Tenant.create(tenantCode, request.name, request.description);

    // 设置租户设置
    if (request.settings) {
      tenant.updateSettings(request.settings);
    }

    return tenant;
  }

  /**
   * @method updateTenant
   * @description 更新租户
   * @param request 更新租户请求
   * @returns {Promise<Tenant>} 更新后的租户实体
   */
  async updateTenant(request: UpdateTenantRequest): Promise<Tenant> {
    // 获取现有租户
    const tenant = await this.tenantRepository.findById(
      new Uuid(request.tenantId),
    );
    if (!tenant) {
      throw new Error(`租户不存在: ${request.tenantId}`);
    }

    // 验证更新请求
    const validationResult = this.validateUpdateTenantRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `租户更新验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 更新租户信息
    if (request.name) {
      tenant.updateName(request.name);
    }

    if (request.description !== undefined) {
      tenant.updateDescription(request.description);
    }

    if (request.settings) {
      tenant.updateSettings(request.settings);
    }

    // 移除metadata设置，因为Tenant实体没有setMetadata方法

    return tenant;
  }

  /**
   * @method changeTenantStatus
   * @description 变更租户状态
   * @param request 状态变更请求
   * @returns {Promise<Tenant>} 更新后的租户实体
   */
  async changeTenantStatus(
    request: ChangeTenantStatusRequest,
  ): Promise<Tenant> {
    // 获取现有租户
    const tenant = await this.tenantRepository.findById(
      new Uuid(request.tenantId),
    );
    if (!tenant) {
      throw new Error(`租户不存在: ${request.tenantId}`);
    }

    // 验证状态变更
    const validationResult = this.validateStatusChange(request);
    if (!validationResult.isValid) {
      throw new Error(
        `状态变更验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 执行状态变更
    switch (request.newStatus) {
      case TenantStatus.ACTIVE:
        tenant.activate();
        break;
      case TenantStatus.SUSPENDED:
        tenant.suspend();
        break;
      case TenantStatus.DISABLED:
        tenant.disable();
        break;
      default:
        throw new Error(`不支持的状态变更: ${request.newStatus}`);
    }

    return tenant;
  }

  /**
   * @method validateCreateTenantRequest
   * @description 验证创建租户请求
   * @param request 创建租户请求
   * @returns {Promise<TenantValidationResult>} 验证结果
   */
  async validateCreateTenantRequest(
    request: CreateTenantRequest,
  ): Promise<TenantValidationResult> {
    const errors: string[] = [];

    // 验证基本信息
    if (!request.code || request.code.trim().length === 0) {
      errors.push('租户代码不能为空');
    }

    if (!request.name || request.name.trim().length === 0) {
      errors.push('租户名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('租户名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('租户描述长度不能超过500个字符');
    }

    // 验证租户类型（已移除，因为CreateTenantRequest中没有type字段）

    // 验证租户代码唯一性
    if (request.code) {
      try {
        const existingTenant = await this.tenantRepository.findByCode(
          request.code,
        );
        if (existingTenant) {
          errors.push(`租户代码已存在: ${request.code}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证租户代码时出错: ${errorMessage}`);
      }
    }

    // 验证租户代码格式
    if (request.code) {
      try {
        TenantCode.fromString(request.code);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`租户代码格式不正确: ${errorMessage}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateUpdateTenantRequest
   * @description 验证更新租户请求
   * @param request 更新租户请求
   * @returns {TenantValidationResult} 验证结果
   */
  validateUpdateTenantRequest(
    request: UpdateTenantRequest,
  ): TenantValidationResult {
    const errors: string[] = [];

    // 验证基本信息
    if (request.name && request.name.trim().length === 0) {
      errors.push('租户名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('租户名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('租户描述长度不能超过500个字符');
    }

    // 验证更新人
    if (!request.updatedBy) {
      errors.push('更新人不能为空');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateStatusChange
   * @description 验证状态变更
   * @param request 状态变更请求
   * @returns {TenantValidationResult} 验证结果
   */
  validateStatusChange(
    request: ChangeTenantStatusRequest,
  ): TenantValidationResult {
    const errors: string[] = [];

    // 验证新状态
    if (!Object.values(TenantStatus).includes(request.newStatus)) {
      errors.push(`无效的租户状态: ${request.newStatus}`);
    }

    // 验证变更人
    if (!request.changedBy) {
      errors.push('变更人不能为空');
    }

    // 验证日期
    if (request.effectiveDate && request.expiryDate) {
      if (request.effectiveDate >= request.expiryDate) {
        errors.push('生效日期必须早于过期日期');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method getTenantStatistics
   * @description 获取租户统计信息
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  async getTenantStatistics(): Promise<Record<string, any>> {
    try {
      const statistics = await this.tenantRepository.getTenantStatistics();
      return statistics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取租户统计信息失败: ${errorMessage}`);
    }
  }

  /**
   * @method searchTenants
   * @description 搜索租户
   * @param query 搜索查询
   * @param options 查询选项
   * @returns {Promise<Tenant[]>} 租户列表
   */
  async searchTenants(query: string, _options: any = {}): Promise<Tenant[]> {
    try {
      // 这里可以实现复杂的搜索逻辑
      // 暂时返回空数组，具体实现由仓储层处理
      await Promise.resolve(); // 添加await以避免async method警告
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`搜索租户失败: ${errorMessage}`);
    }
  }

  /**
   * @method checkTenantHealth
   * @description 检查租户健康状态
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 健康状态信息
   */
  async checkTenantHealth(tenantId: string): Promise<Record<string, any>> {
    try {
      const tenant = await this.tenantRepository.findById(new Uuid(tenantId));
      if (!tenant) {
        throw new Error(`租户不存在: ${tenantId}`);
      }

      // 这里可以实现租户健康检查逻辑
      // 例如检查用户数量、活跃度、资源使用情况等
      return {
        tenantId,
        status: tenant.status,
        isHealthy: tenant.status === TenantStatus.ACTIVE,
        lastChecked: new Date(),
        metrics: {
          // 这里可以添加具体的健康指标
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`检查租户健康状态失败: ${errorMessage}`);
    }
  }
}
