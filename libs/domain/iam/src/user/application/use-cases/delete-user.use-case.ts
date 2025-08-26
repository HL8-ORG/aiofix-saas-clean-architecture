import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { DeleteUserCommand } from '../commands/delete-user.command';

/**
 * @interface ICommandBus
 * @description 命令总线接口
 */
export interface ICommandBus {
  execute<TCommand, TResult>(command: TCommand): Promise<TResult>;
}

/**
 * @interface DeleteUserInput
 * @description 删除用户输入接口
 */
export interface DeleteUserInput {
  userId: string;
  hardDelete?: boolean;
  reason?: string;
  remark?: string;
}

/**
 * @class DeleteUserUseCase
 * @description 删除用户Use-Case，实现删除用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，提供统一的业务用例执行入口
 * 2. 作为CQRS模式的包装器，协调命令操作
 * 3. 负责业务逻辑编排和验证
 * 4. 支持依赖注入，便于测试和维护
 *
 * 功能与业务规则：
 * 1. 验证删除用户的输入参数
 * 2. 执行删除用户命令
 * 3. 支持软删除和硬删除
 * 4. 记录删除原因和备注
 */
@Injectable()
export class DeleteUserUseCase implements IUseCase<DeleteUserInput, void> {
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行删除用户Use-Case
   * @param input 删除用户输入
   * @returns void
   */
  async execute(input: DeleteUserInput): Promise<void> {
    // 1. 创建命令
    const command = new DeleteUserCommand(
      input.userId,
      input.hardDelete || false,
      input.reason,
      input.remark,
    );

    // 2. 执行命令
    await this.commandBus.execute(command);
  }
}
