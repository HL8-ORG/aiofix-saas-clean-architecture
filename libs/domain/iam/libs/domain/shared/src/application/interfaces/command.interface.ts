/**
 * @interface ICommand
 * @description 命令接口，定义CQRS模式中命令的标准接口
 */
export interface ICommand {
  readonly commandId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
}
