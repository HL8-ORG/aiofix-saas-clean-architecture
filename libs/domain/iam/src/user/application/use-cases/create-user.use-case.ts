import { Injectable } from '@nestjs/common';
import { IUseCase } from '@aiofix/domain-shared';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserCommand } from '../commands/create-user.command';
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
 * @class CreateUserUseCase
 * @description 创建用户Use-Case，实现创建用户的业务逻辑
 *
 * 主要原理与机制：
 * 1. 实现IUseCase接口，提供统一的业务用例执行入口
 * 2. 作为CQRS模式的包装器，协调命令和查询操作
 * 3. 负责业务逻辑编排和验证
 * 4. 支持依赖注入，便于测试和维护
 *
 * 功能与业务规则：
 * 1. 验证创建用户的输入参数
 * 2. 执行创建用户命令
 * 3. 查询创建后的用户信息
 * 4. 返回标准化的用户响应
 */
@Injectable()
export class CreateUserUseCase
  implements IUseCase<CreateUserDto, UserResponseDto>
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
   * @description 执行创建用户Use-Case
   * @param input 创建用户DTO
   * @returns 用户响应DTO
   */
  async execute(input: CreateUserDto): Promise<UserResponseDto> {
    // 1. 创建命令
    const command = new CreateUserCommand(input);

    // 2. 执行命令
    await this.commandBus.execute(command);

    // 3. 查询结果
    // 注意：这里需要从命令执行结果中获取用户ID
    // 暂时使用一个占位符，实际实现时需要从命令处理器返回用户ID
    const userId = 'temp-user-id'; // TODO: 从命令执行结果获取
    const query = new GetUserQuery(userId);
    return this.queryBus.execute(query);
  }
}
