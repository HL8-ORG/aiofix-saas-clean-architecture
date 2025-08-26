/**
 * @file organization-domain.service.ts
 * @description 组织领域服务
 *
 * 该文件定义了组织领域服务，负责处理组织相关的复杂业务逻辑。
 * 该服务封装了不自然属于组织实体的业务规则和操作。
 */

import {
  Organization,
  OrganizationStatus,
  OrganizationType,
} from '../entities/organization.entity';
import { OrganizationCode } from '../value-objects/organization-code.vo';
import { OrganizationRepository } from '../repositories/organization-repository.interface';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface CreateOrganizationRequest
 * @description 创建组织请求
 */
export interface CreateOrganizationRequest {
  code: string;
  name: string;
  description?: string;
  tenantId: string;
  parentOrganizationId?: string;
  type: OrganizationType;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy?: string;
}

/**
 * @interface UpdateOrganizationRequest
 * @description 更新组织请求
 */
export interface UpdateOrganizationRequest {
  organizationId: string;
  name?: string;
  description?: string;
  parentOrganizationId?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedBy: string;
}

/**
 * @interface ChangeOrganizationStatusRequest
 * @description 变更组织状态请求
 */
export interface ChangeOrganizationStatusRequest {
  organizationId: string;
  newStatus: OrganizationStatus;
  changedBy: string;
  reason?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

/**
 * @interface OrganizationValidationResult
 * @description 组织验证结果
 */
export interface OrganizationValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * @class OrganizationDomainService
 * @description 组织领域服务
 *
 * 该服务负责处理组织相关的复杂业务逻辑，包括：
 * 1. 组织创建的业务规则验证
 * 2. 组织层级管理的业务逻辑
 * 3. 组织状态变更的业务规则
 * 4. 组织设置的验证和管理
 * 5. 组织统计信息的计算
 * 6. 组织间关系的管理
 */
export class OrganizationDomainService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * @method createOrganization
   * @description 创建组织
   * @param request 创建组织请求
   * @returns {Promise<Organization>} 创建的组织实体
   */
  async createOrganization(
    request: CreateOrganizationRequest,
  ): Promise<Organization> {
    // 验证创建请求
    const validationResult =
      await this.validateCreateOrganizationRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `组织创建验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 创建组织代码值对象
    const organizationCode = OrganizationCode.fromString(request.code);

    // 创建组织实体
    const organization = Organization.create(
      organizationCode,
      request.name,
      new Uuid(request.tenantId),
      request.type,
      request.parentOrganizationId
        ? new Uuid(request.parentOrganizationId)
        : undefined,
    );

    // 设置组织设置和元数据
    if (request.settings) {
      organization.updateSettings(request.settings);
    }

    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        organization.setMetadata(key, value);
      });
    }

    return organization;
  }

  /**
   * @method updateOrganization
   * @description 更新组织
   * @param request 更新组织请求
   * @returns {Promise<Organization>} 更新后的组织实体
   */
  async updateOrganization(
    request: UpdateOrganizationRequest,
  ): Promise<Organization> {
    // 获取现有组织
    const organization = await this.organizationRepository.findById(
      new Uuid(request.organizationId),
    );
    if (!organization) {
      throw new Error(`组织不存在: ${request.organizationId}`);
    }

    // 验证更新请求
    const validationResult =
      await this.validateUpdateOrganizationRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `组织更新验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 更新组织信息
    if (request.name) {
      organization.updateName(request.name);
    }

    if (request.description !== undefined) {
      organization.updateDescription(request.description);
    }

    if (request.parentOrganizationId) {
      organization.setParent(new Uuid(request.parentOrganizationId));
    }

    if (request.settings) {
      organization.updateSettings(request.settings);
    }

    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        organization.setMetadata(key, value);
      });
    }

    return organization;
  }

  /**
   * @method changeOrganizationStatus
   * @description 变更组织状态
   * @param request 状态变更请求
   * @returns {Promise<Organization>} 更新后的组织实体
   */
  async changeOrganizationStatus(
    request: ChangeOrganizationStatusRequest,
  ): Promise<Organization> {
    // 获取现有组织
    const organization = await this.organizationRepository.findById(
      new Uuid(request.organizationId),
    );
    if (!organization) {
      throw new Error(`组织不存在: ${request.organizationId}`);
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
      case OrganizationStatus.ACTIVE:
        organization.activate();
        break;
      case OrganizationStatus.SUSPENDED:
        organization.suspend();
        break;
      case OrganizationStatus.DISABLED:
        organization.disable();
        break;
      default:
        throw new Error(`不支持的状态变更: ${String(request.newStatus)}`);
    }

    return organization;
  }

  /**
   * @method moveOrganization
   * @description 移动组织（改变父级关系）
   * @param organizationId 组织ID
   * @param newParentId 新父组织ID
   * @param movedBy 移动人
   * @returns {Promise<Organization>} 更新后的组织实体
   */
  async moveOrganization(
    organizationId: string,
    newParentId: string,
    _movedBy: string,
  ): Promise<Organization> {
    // 获取现有组织
    const organization = await this.organizationRepository.findById(
      new Uuid(organizationId),
    );
    if (!organization) {
      throw new Error(`组织不存在: ${organizationId}`);
    }

    // 验证移动操作
    const validationResult = await this.validateMoveOrganization(
      organizationId,
      newParentId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `组织移动验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 执行移动操作
    organization.setParent(new Uuid(newParentId));

    return organization;
  }

  /**
   * @method getOrganizationTree
   * @description 获取组织树结构
   * @param tenantId 租户ID
   * @param rootOrganizationId 根组织ID（可选）
   * @returns {Promise<Organization[]>} 组织树结构
   */
  async getOrganizationTree(
    tenantId: string,
    rootOrganizationId?: string,
  ): Promise<Organization[]> {
    try {
      return await this.organizationRepository.getOrganizationTree(
        tenantId,
        rootOrganizationId,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取组织树失败: ${errorMessage}`);
    }
  }

  /**
   * @method getOrganizationPath
   * @description 获取组织路径
   * @param organizationId 组织ID
   * @returns {Promise<Organization[]>} 组织路径
   */
  async getOrganizationPath(organizationId: string): Promise<Organization[]> {
    try {
      return await this.organizationRepository.getOrganizationPath(
        organizationId,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取组织路径失败: ${errorMessage}`);
    }
  }

  /**
   * @method validateCreateOrganizationRequest
   * @description 验证创建组织请求
   * @param request 创建组织请求
   * @returns {Promise<OrganizationValidationResult>} 验证结果
   */
  async validateCreateOrganizationRequest(
    request: CreateOrganizationRequest,
  ): Promise<OrganizationValidationResult> {
    const errors: string[] = [];

    // 验证基本信息
    if (!request.code || request.code.trim().length === 0) {
      errors.push('组织代码不能为空');
    }

    if (!request.name || request.name.trim().length === 0) {
      errors.push('组织名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('组织名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('组织描述长度不能超过500个字符');
    }

    if (!request.tenantId) {
      errors.push('租户ID不能为空');
    }

    // 验证组织类型
    if (!Object.values(OrganizationType).includes(request.type)) {
      errors.push(`无效的组织类型: ${request.type}`);
    }

    // 验证组织代码唯一性
    if (request.code) {
      try {
        const existingOrganization =
          await this.organizationRepository.findByCode(
            request.code,
            request.tenantId,
          );
        if (existingOrganization) {
          errors.push(`组织代码已存在: ${request.code}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证组织代码时出错: ${errorMessage}`);
      }
    }

    // 验证组织代码格式
    if (request.code) {
      try {
        OrganizationCode.fromString(request.code);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`组织代码格式不正确: ${errorMessage}`);
      }
    }

    // 验证父组织
    if (request.parentOrganizationId) {
      try {
        const parentOrganization = await this.organizationRepository.findById(
          new Uuid(request.parentOrganizationId),
        );
        if (!parentOrganization) {
          errors.push(`父组织不存在: ${request.parentOrganizationId}`);
        } else if (parentOrganization.tenantId.value !== request.tenantId) {
          errors.push('父组织必须属于同一租户');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证父组织时出错: ${errorMessage}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateUpdateOrganizationRequest
   * @description 验证更新组织请求
   * @param request 更新组织请求
   * @returns {Promise<OrganizationValidationResult>} 验证结果
   */
  async validateUpdateOrganizationRequest(
    request: UpdateOrganizationRequest,
  ): Promise<OrganizationValidationResult> {
    const errors: string[] = [];

    // 验证基本信息
    if (request.name && request.name.trim().length === 0) {
      errors.push('组织名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('组织名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('组织描述长度不能超过500个字符');
    }

    // 验证更新人
    if (!request.updatedBy) {
      errors.push('更新人不能为空');
    }

    // 验证父组织
    if (request.parentOrganizationId) {
      try {
        const parentOrganization = await this.organizationRepository.findById(
          new Uuid(request.parentOrganizationId),
        );
        if (!parentOrganization) {
          errors.push(`父组织不存在: ${request.parentOrganizationId}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证父组织时出错: ${errorMessage}`);
      }
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
   * @returns {OrganizationValidationResult} 验证结果
   */
  validateStatusChange(
    request: ChangeOrganizationStatusRequest,
  ): OrganizationValidationResult {
    const errors: string[] = [];

    // 验证新状态
    if (!Object.values(OrganizationStatus).includes(request.newStatus)) {
      errors.push(`无效的组织状态: ${request.newStatus}`);
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
   * @method validateMoveOrganization
   * @description 验证组织移动
   * @param organizationId 组织ID
   * @param newParentId 新父组织ID
   * @returns {Promise<OrganizationValidationResult>} 验证结果
   */
  async validateMoveOrganization(
    organizationId: string,
    newParentId: string,
  ): Promise<OrganizationValidationResult> {
    const errors: string[] = [];

    // 验证不能移动到自己的子组织
    try {
      const descendants =
        await this.organizationRepository.getOrganizationDescendants(
          organizationId,
        );
      const isDescendant = descendants.some(
        org => org.id.value === newParentId,
      );
      if (isDescendant) {
        errors.push('不能将组织移动到其子组织下');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`验证组织层级时出错: ${errorMessage}`);
    }

    // 验证新父组织是否存在
    try {
      const newParent = await this.organizationRepository.findById(
        new Uuid(newParentId),
      );
      if (!newParent) {
        errors.push(`新父组织不存在: ${newParentId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`验证新父组织时出错: ${errorMessage}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method getOrganizationStatistics
   * @description 获取组织统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  async getOrganizationStatistics(
    tenantId: string,
  ): Promise<Record<string, any>> {
    try {
      const statistics =
        await this.organizationRepository.getOrganizationStatistics(tenantId);
      return statistics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取组织统计信息失败: ${errorMessage}`);
    }
  }

  /**
   * @method searchOrganizations
   * @description 搜索组织
   * @param query 搜索查询
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns {Promise<Organization[]>} 组织列表
   */
  async searchOrganizations(
    query: string,
    tenantId: string,
    _options: any = {},
  ): Promise<Organization[]> {
    try {
      // 这里可以实现复杂的搜索逻辑
      // 暂时返回空数组，具体实现由仓储层处理
      await Promise.resolve(); // 添加await以避免async method警告
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`搜索组织失败: ${errorMessage}`);
    }
  }

  /**
   * @method checkOrganizationHealth
   * @description 检查组织健康状态
   * @param organizationId 组织ID
   * @returns {Promise<Record<string, any>>} 健康状态信息
   */
  async checkOrganizationHealth(
    organizationId: string,
  ): Promise<Record<string, any>> {
    try {
      const organization = await this.organizationRepository.findById(
        new Uuid(organizationId),
      );
      if (!organization) {
        throw new Error(`组织不存在: ${organizationId}`);
      }

      // 这里可以实现组织健康检查逻辑
      // 例如检查用户数量、活跃度、资源使用情况等
      return {
        organizationId,
        status: organization.status,
        isHealthy: organization.status === OrganizationStatus.ACTIVE,
        lastChecked: new Date(),
        metrics: {
          // 这里可以添加具体的健康指标
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`检查组织健康状态失败: ${errorMessage}`);
    }
  }
}
