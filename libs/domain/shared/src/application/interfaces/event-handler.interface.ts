/**
 * @interface IEventHandler
 * @description 事件处理器接口，定义CQRS模式中事件处理器的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了事件处理器的统一接口规范，确保所有事件处理器都遵循相同的契约
 * 2. 事件处理器负责处理领域事件，执行相应的业务逻辑
 * 3. 采用泛型设计，支持不同类型的事件
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的事件处理入口
 * 2. 支持事件的路由和处理
 * 3. 支持事件的验证和错误处理
 * 4. 支持事件的审计和日志记录
 */
export interface IEventHandler<TEvent> {
  /**
   * @method handle
   * @description 处理事件
   * @param event 事件对象
   * @returns 处理结果
   */
  handle(event: TEvent): Promise<void>;
}
