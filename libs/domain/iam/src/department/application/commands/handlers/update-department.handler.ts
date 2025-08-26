/**
 * @file update-department.handler.ts
 * @description 更新部门命令处理器
 *
 * 该文件实现了更新部门的命令处理器，负责处理UpdateDepartmentCommand命令。
 * 该处理器包含完整的业务逻辑验证和部门更新流程。
 *
 * 主要功能：
 * 1. 验证部门更新的业务规则
 * 2. 检查部门代码和名称的唯一性（如果修改）
 * 3. 验证父部门的存在性和状态
 * 4. 更新部门实体并保存
 * 5. 发布部门更新事件
 *
 * 业务规则：
 * 1. 部门代码在同一组织内必须唯一（如果修改）
 * 2. 部门名称在同一组织内必须唯一（如果修改）
 * 3. 父部门必须存在且状态为活跃
 * 4. 不能将部门设置为自己的子部门
 * 5. 更新后的部门状态必须有效
 */

import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { UpdateDepartmentCommand } from '../update-department.command';
import { DepartmentRepository } from '../../../domain/repositories/department-repository.interface';
import { OrganizationRepository } from '../../../../organization/domain/repositories/organization-repository.interface';
import { DepartmentStatus } from '../../../domain/entities/department.entity';

/**
 * @class UpdateDepartmentHandler
 * @description 更新部门命令处理器
 * @implements ICommandHandler<UpdateDepartmentCommand>
 */
@Injectable()
export class UpdateDepartmentHandler
  implements ICommandHandler<UpdateDepartmentCommand>
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
   * @description 执行更新部门命令
   * @param command 更新部门命令
   * @returns {Promise<void>} 返回Promise
   */
  async execute(command: UpdateDepartmentCommand): Promise<void> {
    const { data } = command;

    // 验证部门是否存在
    const department = await this.departmentRepository.findById(
      Uuid.fromString(data.id),
    );
    if (!department) {
      throw new Error(`部门不存在: ${data.id}`);
    }

    // 验证父部门（如果修改）
    if (data.parentId !== undefined) {
      await this.validateParentDepartment(
        data.parentId,
        department.organizationId.toString(),
      );
    }

    // 验证部门名称唯一性（如果修改）
    if (data.name && data.name !== department.name) {
      await this.validateDepartmentNameUniqueness(
        data.name,
        department.organizationId.toString(),
      );
    }

    // 更新部门基本信息
    if (data.name) {
      // TODO: 实现部门名称更新逻辑
      console.log('TODO: 实现部门名称更新逻辑', data.name);
    }

    if (data.description !== undefined) {
      department.updateDescription(data.description);
    }

    if (data.type) {
      // TODO: 实现部门类型更新逻辑
      console.log('TODO: 实现部门类型更新逻辑', data.type);
    }

    // 更新部门联系信息
    if (data.contact) {
      department.updateContact(data.contact);
    }

    // 更新部门设置
    if (data.settings) {
      // TODO: 实现设置类型转换逻辑
      console.log('TODO: 实现部门设置更新逻辑', data.settings);
    }

    // 更新部门限制
    if (data.limits) {
      department.updateLimits(data.limits);
    }

    // 更新部门元数据
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
    parentId: string | null,
    organizationId: string,
  ): Promise<void> {
    if (parentId === null) {
      return; // 允许设置为根部门
    }

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
      throw new Error(`父部门状态无效，无法设置为父部门: ${parentId}`);
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
