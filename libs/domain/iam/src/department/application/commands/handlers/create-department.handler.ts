/**
 * @file create-department.handler.ts
 * @description 创建部门命令处理器
 *
 * 该文件实现了创建部门的命令处理器，负责处理CreateDepartmentCommand命令。
 * 该处理器包含完整的业务逻辑验证和部门创建流程。
 *
 * 主要功能：
 * 1. 验证部门创建的业务规则
 * 2. 检查部门代码和名称的唯一性
 * 3. 验证父部门的存在性和状态
 * 4. 创建部门实体并保存
 * 5. 发布部门创建事件
 *
 * 业务规则：
 * 1. 部门代码在同一组织内必须唯一
 * 2. 部门名称在同一组织内必须唯一
 * 3. 父部门必须存在且状态为活跃
 * 4. 部门必须归属于有效的组织
 */

import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { CreateDepartmentCommand } from '../create-department.command';
import { DepartmentRepository } from '../../../domain/repositories/department-repository.interface';
import { OrganizationRepository } from '../../../../organization/domain/repositories/organization-repository.interface';
import { Department } from '../../../domain/entities/department.entity';
import { DepartmentCode } from '../../../domain/value-objects/department-code.vo';
import {
  DepartmentStatus,
  DepartmentType,
} from '../../../domain/entities/department.entity';
import { OrganizationStatus } from '../../../../organization/domain/entities/organization.entity';

/**
 * @class CreateDepartmentHandler
 * @description 创建部门命令处理器
 * @implements ICommandHandler<CreateDepartmentCommand>
 */
@Injectable()
export class CreateDepartmentHandler
  implements ICommandHandler<CreateDepartmentCommand>
{
  /**
   * @constructor
   * @param departmentRepository 部门仓储接口
   * @param organizationRepository 组织仓储接口
   */
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * @method execute
   * @description 执行创建部门命令
   * @param command 创建部门命令
   * @returns {Promise<void>} 返回Promise
   */
  async execute(command: CreateDepartmentCommand): Promise<void> {
    const { data } = command;

    // 验证组织是否存在
    const organization = await this.organizationRepository.findById(
      Uuid.fromString(data.organizationId),
    );
    if (!organization) {
      throw new Error(`组织不存在: ${data.organizationId}`);
    }

    // 验证组织状态
    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new Error(`组织状态无效，无法创建部门: ${data.organizationId}`);
    }

    // 验证父部门（如果指定）
    if (data.parentId) {
      await this.validateParentDepartment(data.parentId, data.organizationId);
    }

    // 验证部门代码唯一性
    await this.validateDepartmentCodeUniqueness(data.code, data.organizationId);

    // 验证部门名称唯一性
    await this.validateDepartmentNameUniqueness(data.name, data.organizationId);

    // 创建部门代码值对象
    const departmentCode = DepartmentCode.fromString(data.code);

    // 创建部门实体
    const department = new Department(
      Uuid.generate(),
      departmentCode,
      data.name,
      Uuid.fromString(data.organizationId),
      data.type as DepartmentType,
      data.parentId ? Uuid.fromString(data.parentId) : undefined,
    );

    // 设置部门描述
    if (data.description) {
      department.updateDescription(data.description);
    }

    // 设置部门联系信息
    if (data.contact) {
      department.updateContact(data.contact);
    }

    // 设置部门设置
    if (data.settings) {
      // TODO: 完善设置更新逻辑
      console.log('TODO: 实现部门设置更新逻辑', data.settings);
    }

    // 设置部门限制
    if (data.limits) {
      // TODO: 完善限制更新逻辑
      console.log('TODO: 实现部门限制更新逻辑', data.limits);
    }

    // 设置部门元数据
    if (data.metadata) {
      // TODO: 实现元数据更新逻辑
      console.log('TODO: 实现部门元数据更新逻辑', data.metadata);
    }

    // 保存部门
    await this.departmentRepository.save(department);
  }

  /**
   * @method validateParentDepartment
   * @description 验证父部门
   * @param parentId 父部门ID
   * @param organizationId 组织ID
   * @returns {Promise<void>} 返回Promise
   */
  private async validateParentDepartment(
    parentId: string,
    organizationId: string,
  ): Promise<void> {
    const parentDepartment = await this.departmentRepository.findById(
      Uuid.fromString(parentId),
    );
    if (!parentDepartment) {
      throw new Error(`父部门不存在: ${parentId}`);
    }

    if (parentDepartment.organizationId.toString() !== organizationId) {
      throw new Error(`父部门不属于指定组织: ${parentId}`);
    }

    if (parentDepartment.status !== DepartmentStatus.ACTIVE) {
      throw new Error(`父部门状态无效，无法创建子部门: ${parentId}`);
    }
  }

  /**
   * @method validateDepartmentCodeUniqueness
   * @description 验证部门代码唯一性
   * @param code 部门代码
   * @param organizationId 组织ID
   * @returns {Promise<void>} 返回Promise
   */
  private async validateDepartmentCodeUniqueness(
    code: string,
    organizationId: string,
  ): Promise<void> {
    const existingDepartment = await this.departmentRepository.findByCode(
      code,
      organizationId,
    );
    if (existingDepartment) {
      throw new Error(`部门代码已存在: ${code}`);
    }
  }

  /**
   * @method validateDepartmentNameUniqueness
   * @description 验证部门名称唯一性
   * @param name 部门名称
   * @param organizationId 组织ID
   * @returns {Promise<void>} 返回Promise
   */
  private async validateDepartmentNameUniqueness(
    name: string,
    organizationId: string,
  ): Promise<void> {
    const existingDepartments = await this.departmentRepository.findByName(
      name,
      organizationId,
    );
    if (existingDepartments.length > 0) {
      throw new Error(`部门名称已存在: ${name}`);
    }
  }
}
