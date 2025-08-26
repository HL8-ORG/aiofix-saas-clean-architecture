/**
 * @decorator AggregateRoot
 * @description 聚合根装饰器，用于显式标记领域聚合根
 * @example
 * @AggregateRoot()
 * class User extends BaseEntity { ... }
 */
export function AggregateRoot() {
  return (target: Function) => {
    Reflect.defineMetadata('DDD:AggregateRoot', true, target);
    // 自动注册领域事件处理器
    if (!Reflect.hasMetadata('DDD:EventHandlers', target)) {
      Reflect.defineMetadata('DDD:EventHandlers', [], target);
    }
  };
}
