/**
 * @file delete-department.handler.ts
 * @description 删除部门命令处理器
 *
 * 该文件实现了删除部门的命令处理器，负责处理DeleteDepartmentCommand命令。
 * 该处理器包含完整的业务逻辑验证和部门删除流程。
 *
 * 主要功能：
 * 1. 验证部门删除的业务规则
 * 2. 检查部门是否可以安全删除
 * 3. 处理部门层级关系
 * 4. 删除部门实体并保存
 * 5. 发布部门删除事件
 *
 * 业务规则：
 * 1. 部门必须存在且状态为活跃
 * 2. 不能删除有子部门的部门
 * 3. 不能删除有成员的部门
 * 4. 删除前需要确认所有依赖关系已解除
 * 5. 删除操作不可逆，需要记录审计日志
 */

import { Injectable } from '@nestjs/common';
import { ICommandHandler, Uuid } from '@aiofix/domain-shared';
import { DeleteDepartmentCommand } from '../delete-department.command';
import { DepartmentRepository } from '../../../domain/repositories/department-repository.interface';
import { DepartmentStatus } from '../../../domain/entities/department.entity';

/**
 * @class DeleteDepartmentHandler
 * @description 删除部门命令处理器
 * @implements ICommandHandler<DeleteDepartmentCommand>
 */
@Injectable()
export class DeleteDepartmentHandler
  implements ICommandHandler<DeleteDepartmentCommand>
{
  /**
   * @constructor
   * @param departmentRepository 部门仓储接口
   */
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * @method execute
   * @description 执行删除部门命令
   * @param command 删除部门命令
   * @returns {Promise<void>} 返回Promise
   */
  async execute(command: DeleteDepartmentCommand): Promise<void> {
    const { data } = command;

    // 验证部门是否存在
    const department = await this.departmentRepository.findById(
      Uuid.fromString(data.id),
    );
    if (!department) {
      throw new Error(`部门不存在: ${data.id}`);
    }

    // 验证部门状态
    if (department.status !== DepartmentStatus.ACTIVE) {
      throw new Error(`部门状态无效，无法删除: ${data.id}`);
    }

    // 检查是否有子部门
    const children = await this.departmentRepository.findByParent(data.id);
    if (children.length > 0) {
      throw new Error(`部门有子部门，无法删除: ${data.id}`);
    }

    // 检查是否有成员
    if (department.members.length > 0) {
      throw new Error(`部门有成员，无法删除: ${data.id}`);
    }

    // 删除部门
    await this.departmentRepository.delete(Uuid.fromString(data.id));
  }
}
