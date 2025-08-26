/**
 * @interface IUseCase
 * @description Use-Case基础接口，定义应用层业务用例的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了应用层业务用例的统一接口规范，确保所有Use-Case都遵循相同的契约
 * 2. 采用泛型设计，支持不同类型的输入参数和输出结果
 * 3. 作为Clean Architecture中应用层的核心抽象，隔离业务逻辑与基础设施
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的业务用例执行入口
 * 2. 支持输入参数验证和输出结果封装
 * 3. 作为CQRS模式的包装器，协调命令和查询操作
 * 4. 支持复杂业务场景的编排和协调
 */
export interface IUseCase<TInput, TOutput> {
  /**
   * @method execute
   * @description 执行Use-Case
   * @param input 输入参数
   * @returns 执行结果
   */
  execute(input: TInput): Promise<TOutput>;
}
