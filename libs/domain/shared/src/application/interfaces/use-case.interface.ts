/**
 * @interface IUseCase
 * @description 用例接口，定义应用层用例的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了用例的统一接口规范，确保所有用例都遵循相同的契约
 * 2. 用例代表一个完整的业务流程，协调多个操作
 * 3. 采用泛型设计，支持不同类型的输入和输出
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的用例执行入口
 * 2. 支持业务流程的编排
 * 3. 支持事务管理和错误处理
 * 4. 支持用例的审计和日志记录
 */
export interface IUseCase<TInput, TOutput> {
  /**
   * @method execute
   * @description 执行用例
   * @param input 用例输入参数
   * @returns 用例执行结果
   */
  execute(input: TInput): Promise<TOutput>;
}
