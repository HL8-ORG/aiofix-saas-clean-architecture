import { ICommand } from './command.interface';

/**
 * @interface ICommandHandler
 * @description 命令处理器接口，定义CQRS模式中命令处理器的标准接口
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}
