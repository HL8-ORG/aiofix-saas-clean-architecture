import { Injectable } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Username } from '../../../domain/value-objects/username.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { Uuid } from '@aiofix/domain-shared';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';

/**
 * @interface ICommandHandler
 * @description 命令处理器接口
 */
export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<any>;
}

/**
 * @interface IEventBus
 * @description 事件总线接口
 */
export interface IEventBus {
  publish(event: any): void;
}

/**
 * @class CreateUserHandler
 * @description 创建用户命令处理器，实现创建用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理CreateUserCommand
 * 2. 使用领域服务进行业务验证
 * 3. 创建用户聚合根并保存到仓储
 * 4. 发布用户创建事件
 * 5. 支持事件溯源和审计追踪
 *
 * 功能与业务规则：
 * 1. 验证用户创建的业务规则
 * 2. 创建用户聚合根
 * 3. 保存用户到仓储
 * 4. 发布用户创建事件
 * 5. 返回创建结果
 */
@Injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  /**
   * @constructor
   * @description 构造函数
   * @param userRepository 用户仓储
   * @param eventBus 事件总线
   */
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: IEventBus,
  ) {}

  /**
   * @method execute
   * @description 执行创建用户命令
   * @param command 创建用户命令
   * @returns 创建的用户ID
   */
  async execute(command: CreateUserCommand): Promise<string> {
    // 1. 业务验证
    await this.validateUserCreation(command);

    // 2. 创建用户聚合根
    const userId = Uuid.generate();
    const username = new Username(command.username);
    const email = new Email(command.email);
    const password = new Password('temporary-password'); // TODO: 从命令中获取密码
    const tenantId = new Uuid(command.tenantId || 'default-tenant');
    const organizationId = new Uuid(command.organizationId);

    const user = new User(
      userId,
      username,
      email,
      password,
      tenantId,
      organizationId,
    );

    // 3. 设置用户档案信息
    if (command.firstName || command.lastName) {
      user.updateProfile({
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
      });
    }

    // 4. 分配部门（如果有）
    if (command.departmentId) {
      user.addToDepartment(new Uuid(command.departmentId));
    }

    // 5. 分配角色（如果有）
    if (command.roleIds && command.roleIds.length > 0) {
      const roleIds = command.roleIds.map(id => new Uuid(id));
      roleIds.forEach(roleId => user.assignRole(roleId));
    }

    // 6. 保存用户到仓储
    await this.userRepository.save(user);

    // 7. 发布用户创建事件
    const userCreatedEvent = new UserCreatedEvent(user);
    this.eventBus.publish(userCreatedEvent);

    return userId.value;
  }

  /**
   * @method validateUserCreation
   * @description 验证用户创建的业务规则
   * @param command 创建用户命令
   */
  private async validateUserCreation(
    command: CreateUserCommand,
  ): Promise<void> {
    // 验证用户名唯一性
    const existingUserByUsername = await this.userRepository.findByUsername(
      command.username,
      command.tenantId || 'default-tenant',
    );
    if (existingUserByUsername) {
      throw new Error('用户名已存在');
    }

    // 验证邮箱唯一性
    const existingUserByEmail = await this.userRepository.findByEmail(
      command.email,
      command.tenantId || 'default-tenant',
    );
    if (existingUserByEmail) {
      throw new Error('邮箱已存在');
    }

    // TODO: 验证组织是否存在
    // TODO: 验证部门是否存在
    // TODO: 验证角色是否存在
  }
}
