import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserCommand } from '../commands/update-user.command';
import { GetUserQuery } from '../queries/get-user.query';

/**
 * @interface ICommandBus
 * @description 命令总线接口
 */
export interface ICommandBus {
  execute<TCommand, TResult>(command: TCommand): Promise<TResult>;
}

/**
 * @interface IQueryBus
 * @description 查询总线接口
 */
export interface IQueryBus {
  execute<TQuery, TResult>(query: TQuery): Promise<TResult>;
}

/**
 * @interface UpdateUserInput
 * @description 更新用户输入接口
 */
export interface UpdateUserInput {
  userId: string;
  updateData: UpdateUserDto;
}

/**
 * @class UpdateUserUseCase
 * @description 更新用户Use-Case，实现更新用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，提供统一的业务用例执行入口
 * 2. 作为CQRS模式的包装器，协调命令和查询操作
 * 3. 负责业务逻辑编排和验证
 * 4. 支持依赖注入，便于测试和维护
 *
 * 功能与业务规则：
 * 1. 验证更新用户的输入参数
 * 2. 执行更新用户命令
 * 3. 查询更新后的用户信息
 * 4. 返回标准化的用户响应
 */
@Injectable()
export class UpdateUserUseCase
  implements IUseCase<UpdateUserInput, UserResponseDto>
{
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   * @param queryBus 查询总线
   */
  constructor(
    private readonly commandBus: ICommandBus,
    private readonly queryBus: IQueryBus,
  ) {}

  /**
   * @method execute
   * @description 执行更新用户Use-Case
   * @param input 更新用户输入
   * @returns 用户响应DTO
   */
  async execute(input: UpdateUserInput): Promise<UserResponseDto> {
    // 1. 创建命令
    const command = new UpdateUserCommand(input.userId, input.updateData);

    // 2. 执行命令
    await this.commandBus.execute(command);

    // 3. 查询结果
    const query = new GetUserQuery(input.userId);
    return this.queryBus.execute(query);
  }
}
