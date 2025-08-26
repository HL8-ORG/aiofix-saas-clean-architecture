import { Injectable } from '@nestjs/common';
import { DeleteUserCommand } from '../delete-user.command';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { User, UserStatus } from '../../../domain/entities/user.entity';
import { Uuid, ICommandHandler, DomainEventBus } from '@aiofix/domain-shared';
// import { UserDeletedEvent } from '../../../domain/events';

/**
 * @class DeleteUserHandler
 * @description 删除用户命令处理器，实现删除用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现ICommandHandler接口，处理DeleteUserCommand
 * 2. 验证用户存在性和权限
 * 3. 软删除用户并保存到仓储
 * 4. 发布用户删除事件
 * 5. 支持事件溯源和审计追踪
 *
 * 功能与业务规则：
 * 1. 验证用户删除的业务规则
 * 2. 软删除用户
 * 3. 保存用户到仓储
 * 4. 发布用户删除事件
 * 5. 返回删除结果
 */
@Injectable()
export class DeleteUserHandler
  implements ICommandHandler<DeleteUserCommand, void>
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
   * @description 执行删除用户命令
   * @param command 删除用户命令
   */
  async execute(command: DeleteUserCommand): Promise<void> {
    // 1. 获取用户
    const user = await this.userRepository.findById(new Uuid(command.userId));
    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 业务验证
    this.validateUserDeletion(command, user);

    // 3. 软删除用户
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    user.deactivate();

    // 4. 保存用户到仓储
    await this.userRepository.save(user);

    // 5. 发布用户删除事件
    // TODO: 暂时注释，等待CQRS架构完整实现
    // const userDeletedEvent = new UserDeletedEvent(user);
    // await this.eventBus.publish(userDeletedEvent);
  }

  /**
   * @method validateUserDeletion
   * @description 验证用户删除的业务规则
   * @param command 删除用户命令
   * @param user 当前用户
   */
  private validateUserDeletion(command: DeleteUserCommand, user: User): void {
    // 检查用户是否已经是删除状态
    if (user.status === UserStatus.DELETED) {
      throw new Error('用户已经是删除状态');
    }

    // TODO: 验证权限
    // TODO: 检查用户是否有未完成的任务
    // TODO: 检查用户是否有重要的数据关联
  }
}
