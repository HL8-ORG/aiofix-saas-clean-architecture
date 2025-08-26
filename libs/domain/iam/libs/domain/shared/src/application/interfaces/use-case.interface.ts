/**
 * @interface IUseCase
 * @description 用例接口，定义应用层用例的标准接口
 */
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
