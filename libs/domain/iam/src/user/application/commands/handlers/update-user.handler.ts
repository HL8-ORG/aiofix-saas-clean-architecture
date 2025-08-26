import { Injectable } from '@nestjs/common';
import { UpdateUserCommand } from '../update-user.command';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Uuid, ICommandHandler, DomainEventBus } from '@aiofix/domain-shared';
// import { UserUpdatedEvent } from '../../../domain/events/user-updated.event';

/**
 * @class UpdateUserHandler
 * @description 更新用户命令处理器，实现更新用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理UpdateUserCommand
 * 2. 验证用户存在性和权限
 * 3. 更新用户信息并保存到仓储
 * 4. 发布用户更新事件
 * 5. 支持事件溯源和审计追踪
 *
 * 功能与业务规则：
 * 1. 验证用户更新的业务规则
 * 2. 更新用户信息
 * 3. 保存用户到仓储
 * 4. 发布用户更新事件
 * 5. 返回更新结果
 */
@Injectable()
export class UpdateUserHandler
  implements ICommandHandler<UpdateUserCommand, void>
{
  /**
   * @constructor
   * @description 构造函数
   * @param userRepository 用户仓储
   * @param eventBus 事件总线
   */
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  /**
   * @method execute
   * @description 执行更新用户命令
   * @param command 更新用户命令
   */
  async execute(command: UpdateUserCommand): Promise<void> {
    // 1. 获取用户
    const user = await this.userRepository.findById(new Uuid(command.userId));
    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 业务验证
    await this.validateUserUpdate(command, user);

    // 3. 更新用户信息
    if (command.firstName || command.lastName) {
      user.updateProfile({
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
      });
    }

    // 4. 更新部门（如果有）
    if (command.departmentId !== undefined) {
      if (command.departmentId) {
        // 清除现有部门并添加新部门
        user.departmentIds.forEach(deptId => {
          user.removeFromDepartment(deptId);
        });
        user.addToDepartment(new Uuid(command.departmentId));
      } else {
        // 清除所有部门
        user.departmentIds.forEach(deptId => {
          user.removeFromDepartment(deptId);
        });
      }
    }

    // 5. 更新角色（如果有）
    if (command.roleIds !== undefined) {
      // 清除现有角色
      user.roleIds.forEach(roleId => {
        user.removeRole(roleId);
      });
      // 添加新角色
      if (command.roleIds && command.roleIds.length > 0) {
        const roleIds = command.roleIds.map(id => new Uuid(id));
        roleIds.forEach(roleId => user.assignRole(roleId));
      }
    }

    // 6. 保存用户到仓储
    await this.userRepository.save(user);

    // 7. 发布用户更新事件
    // TODO: 暂时注释，等待CQRS架构完整实现
    // const userUpdatedEvent = new UserUpdatedEvent(
    //   user,
    //   ['profile', 'department', 'roles'],
    //   {},
    //   {},
    //   command.updatedBy,
    //   command.updateReason,
    // );
    // await this.eventBus.publish(userUpdatedEvent);
  }

  /**
   * @method validateUserUpdate
   * @description 验证用户更新的业务规则
   * @param _command 更新用户命令
   * @param _user 当前用户
   */
  private async validateUserUpdate(
    _command: UpdateUserCommand,
    _user: User,
  ): Promise<void> {
    // TODO: 验证部门是否存在
    // TODO: 验证角色是否存在
    // TODO: 验证权限
  }
}
