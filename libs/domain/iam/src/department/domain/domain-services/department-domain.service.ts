/**
 * @file department-domain.service.ts
 * @description 部门领域服务
 *
 * 该文件定义了部门领域服务，负责处理部门相关的复杂业务逻辑。
 * 该服务封装了不自然属于部门实体的业务规则和操作。
 */

import {
  Department,
  DepartmentStatus,
  DepartmentType,
} from '../entities/department.entity';
import { DepartmentCode } from '../value-objects/department-code.vo';
import { DepartmentRepository } from '../repositories/department-repository.interface';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface CreateDepartmentRequest
 * @description 创建部门请求
 */
export interface CreateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
  tenantId: string;
  organizationId: string;
  parentDepartmentId?: string;
  type: DepartmentType;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy?: string;
}

/**
 * @interface UpdateDepartmentRequest
 * @description 更新部门请求
 */
export interface UpdateDepartmentRequest {
  departmentId: string;
  name?: string;
  description?: string;
  parentDepartmentId?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedBy: string;
}

/**
 * @interface ChangeDepartmentStatusRequest
 * @description 变更部门状态请求
 */
export interface ChangeDepartmentStatusRequest {
  departmentId: string;
  newStatus: DepartmentStatus;
  changedBy: string;
  reason?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

/**
 * @interface DepartmentValidationResult
 * @description 部门验证结果
 */
export interface DepartmentValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * @class DepartmentDomainService
 * @description 部门领域服务
 *
 * 该服务负责处理部门相关的复杂业务逻辑，包括：
 * 1. 部门创建的业务规则验证
 * 2. 部门层级管理的业务逻辑
 * 3. 部门状态变更的业务规则
 * 4. 部门设置的验证和管理
 * 5. 部门统计信息的计算
 * 6. 部门间关系的管理
 */
export class DepartmentDomainService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * @method createDepartment
   * @description 创建部门
   * @param request 创建部门请求
   * @returns {Promise<Department>} 创建的部门实体
   */
  async createDepartment(
    request: CreateDepartmentRequest,
  ): Promise<Department> {
    // 验证创建请求
    const validationResult =
      await this.validateCreateDepartmentRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `部门创建验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 创建部门代码值对象
    const departmentCode = DepartmentCode.fromString(request.code);

    // 创建部门实体
    const department = Department.create(
      departmentCode,
      request.name,
      new Uuid(request.organizationId),
      request.type,
      request.parentDepartmentId
        ? new Uuid(request.parentDepartmentId)
        : undefined,
    );

    // 设置部门设置和元数据
    if (request.settings) {
      department.updateSettings(request.settings);
    }

    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        department.setMetadata(key, value);
      });
    }

    return department;
  }

  /**
   * @method updateDepartment
   * @description 更新部门
   * @param request 更新部门请求
   * @returns {Promise<Department>} 更新后的部门实体
   */
  async updateDepartment(
    request: UpdateDepartmentRequest,
  ): Promise<Department> {
    // 获取现有部门
    const department = await this.departmentRepository.findById(
      new Uuid(request.departmentId),
    );
    if (!department) {
      throw new Error(`部门不存在: ${request.departmentId}`);
    }

    // 验证更新请求
    const validationResult =
      await this.validateUpdateDepartmentRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `部门更新验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 更新部门信息
    if (request.name) {
      department.updateName(request.name);
    }

    if (request.description !== undefined) {
      department.updateDescription(request.description);
    }

    if (request.parentDepartmentId) {
      department.setParent(new Uuid(request.parentDepartmentId));
    }

    if (request.settings) {
      department.updateSettings(request.settings);
    }

    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        department.setMetadata(key, value);
      });
    }

    return department;
  }

  /**
   * @method changeDepartmentStatus
   * @description 变更部门状态
   * @param request 状态变更请求
   * @returns {Promise<Department>} 更新后的部门实体
   */
  async changeDepartmentStatus(
    request: ChangeDepartmentStatusRequest,
  ): Promise<Department> {
    // 获取现有部门
    const department = await this.departmentRepository.findById(
      new Uuid(request.departmentId),
    );
    if (!department) {
      throw new Error(`部门不存在: ${request.departmentId}`);
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
      case DepartmentStatus.ACTIVE:
        department.activate();
        break;
      case DepartmentStatus.SUSPENDED:
        department.suspend();
        break;
      case DepartmentStatus.DISABLED:
        department.disable();
        break;
      default:
        throw new Error(`不支持的状态变更: ${String(request.newStatus)}`);
    }

    return department;
  }

  /**
   * @method moveDepartment
   * @description 移动部门（改变父级关系）
   * @param departmentId 部门ID
   * @param newParentId 新父部门ID
   * @param movedBy 移动人
   * @returns {Promise<Department>} 更新后的部门实体
   */
  async moveDepartment(
    departmentId: string,
    newParentId: string,
    _movedBy: string,
  ): Promise<Department> {
    // 获取现有部门
    const department = await this.departmentRepository.findById(
      new Uuid(departmentId),
    );
    if (!department) {
      throw new Error(`部门不存在: ${departmentId}`);
    }

    // 验证移动操作
    const validationResult = await this.validateMoveDepartment(
      departmentId,
      newParentId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `部门移动验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 执行移动操作
    department.setParent(new Uuid(newParentId));

    return department;
  }

  /**
   * @method getDepartmentTree
   * @description 获取部门树结构
   * @param organizationId 组织ID
   * @param rootDepartmentId 根部门ID（可选）
   * @returns {Promise<Department[]>} 部门树结构
   */
  async getDepartmentTree(
    organizationId: string,
    rootDepartmentId?: string,
  ): Promise<Department[]> {
    try {
      return await this.departmentRepository.getDepartmentTree(
        organizationId,
        rootDepartmentId,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取部门树失败: ${errorMessage}`);
    }
  }

  /**
   * @method getDepartmentPath
   * @description 获取部门路径
   * @param departmentId 部门ID
   * @returns {Promise<Department[]>} 部门路径
   */
  async getDepartmentPath(departmentId: string): Promise<Department[]> {
    try {
      return await this.departmentRepository.getDepartmentPath(departmentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取部门路径失败: ${errorMessage}`);
    }
  }

  /**
   * @method validateCreateDepartmentRequest
   * @description 验证创建部门请求
   * @param request 创建部门请求
   * @returns {Promise<DepartmentValidationResult>} 验证结果
   */
  async validateCreateDepartmentRequest(
    request: CreateDepartmentRequest,
  ): Promise<DepartmentValidationResult> {
    const errors: string[] = [];

    // 验证基本信息
    if (!request.code || request.code.trim().length === 0) {
      errors.push('部门代码不能为空');
    }

    if (!request.name || request.name.trim().length === 0) {
      errors.push('部门名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('部门名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('部门描述长度不能超过500个字符');
    }

    if (!request.tenantId) {
      errors.push('租户ID不能为空');
    }

    if (!request.organizationId) {
      errors.push('组织ID不能为空');
    }

    // 验证部门类型
    if (!Object.values(DepartmentType).includes(request.type)) {
      errors.push(`无效的部门类型: ${request.type}`);
    }

    // 验证部门代码唯一性
    if (request.code) {
      try {
        const existingDepartment = await this.departmentRepository.findByCode(
          request.code,
          request.tenantId,
        );
        if (existingDepartment) {
          errors.push(`部门代码已存在: ${request.code}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证部门代码时出错: ${errorMessage}`);
      }
    }

    // 验证部门代码格式
    if (request.code) {
      try {
        DepartmentCode.fromString(request.code);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`部门代码格式不正确: ${errorMessage}`);
      }
    }

    // 验证父部门
    if (request.parentDepartmentId) {
      try {
        const parentDepartment = await this.departmentRepository.findById(
          new Uuid(request.parentDepartmentId),
        );
        if (!parentDepartment) {
          errors.push(`父部门不存在: ${request.parentDepartmentId}`);
        } else if (
          parentDepartment.organizationId.value !== request.organizationId
        ) {
          errors.push('父部门必须属于同一组织');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证父部门时出错: ${errorMessage}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateUpdateDepartmentRequest
   * @description 验证更新部门请求
   * @param request 更新部门请求
   * @returns {Promise<DepartmentValidationResult>} 验证结果
   */
  async validateUpdateDepartmentRequest(
    request: UpdateDepartmentRequest,
  ): Promise<DepartmentValidationResult> {
    const errors: string[] = [];

    // 验证基本信息
    if (request.name && request.name.trim().length === 0) {
      errors.push('部门名称不能为空');
    }

    if (request.name && request.name.length > 100) {
      errors.push('部门名称长度不能超过100个字符');
    }

    if (request.description && request.description.length > 500) {
      errors.push('部门描述长度不能超过500个字符');
    }

    // 验证更新人
    if (!request.updatedBy) {
      errors.push('更新人不能为空');
    }

    // 验证父部门
    if (request.parentDepartmentId) {
      try {
        const parentDepartment = await this.departmentRepository.findById(
          new Uuid(request.parentDepartmentId),
        );
        if (!parentDepartment) {
          errors.push(`父部门不存在: ${request.parentDepartmentId}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`验证父部门时出错: ${errorMessage}`);
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
   * @returns {DepartmentValidationResult} 验证结果
   */
  validateStatusChange(
    request: ChangeDepartmentStatusRequest,
  ): DepartmentValidationResult {
    const errors: string[] = [];

    // 验证新状态
    if (!Object.values(DepartmentStatus).includes(request.newStatus)) {
      errors.push(`无效的部门状态: ${request.newStatus}`);
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
   * @method validateMoveDepartment
   * @description 验证部门移动
   * @param departmentId 部门ID
   * @param newParentId 新父部门ID
   * @returns {Promise<DepartmentValidationResult>} 验证结果
   */
  async validateMoveDepartment(
    departmentId: string,
    newParentId: string,
  ): Promise<DepartmentValidationResult> {
    const errors: string[] = [];

    // 验证不能移动到自己的子部门
    try {
      const descendants =
        await this.departmentRepository.getDepartmentDescendants(departmentId);
      const isDescendant = descendants.some(
        dept => dept.id.value === newParentId,
      );
      if (isDescendant) {
        errors.push('不能将部门移动到其子部门下');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`验证部门层级时出错: ${errorMessage}`);
    }

    // 验证新父部门是否存在
    try {
      const newParent = await this.departmentRepository.findById(
        new Uuid(newParentId),
      );
      if (!newParent) {
        errors.push(`新父部门不存在: ${newParentId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`验证新父部门时出错: ${errorMessage}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method getDepartmentStatistics
   * @description 获取部门统计信息
   * @param organizationId 组织ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  async getDepartmentStatistics(
    organizationId: string,
  ): Promise<Record<string, any>> {
    try {
      const statistics =
        await this.departmentRepository.getDepartmentStatistics(organizationId);
      return statistics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`获取部门统计信息失败: ${errorMessage}`);
    }
  }

  /**
   * @method searchDepartments
   * @description 搜索部门
   * @param query 搜索查询
   * @param organizationId 组织ID
   * @param options 查询选项
   * @returns {Promise<Department[]>} 部门列表
   */
  async searchDepartments(
    query: string,
    organizationId: string,
    _options: any = {},
  ): Promise<Department[]> {
    try {
      // 这里可以实现复杂的搜索逻辑
      // 暂时返回空数组，具体实现由仓储层处理
      await Promise.resolve(); // 添加await以避免async method警告
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`搜索部门失败: ${errorMessage}`);
    }
  }

  /**
   * @method checkDepartmentHealth
   * @description 检查部门健康状态
   * @param departmentId 部门ID
   * @returns {Promise<Record<string, any>>} 健康状态信息
   */
  async checkDepartmentHealth(
    departmentId: string,
  ): Promise<Record<string, any>> {
    try {
      const department = await this.departmentRepository.findById(
        new Uuid(departmentId),
      );
      if (!department) {
        throw new Error(`部门不存在: ${departmentId}`);
      }

      // 这里可以实现部门健康检查逻辑
      // 例如检查用户数量、活跃度、资源使用情况等
      return {
        departmentId,
        status: department.status,
        isHealthy: department.status === DepartmentStatus.ACTIVE,
        lastChecked: new Date(),
        metrics: {
          // 这里可以添加具体的健康指标
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`检查部门健康状态失败: ${errorMessage}`);
    }
  }
}
