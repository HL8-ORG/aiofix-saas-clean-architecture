/**
 * @decorator Entity
 * @description 领域实体装饰器，用于标记领域实体
 * @example
 * @Entity()
 * class UserRole extends BaseEntity { ... }
 */
export function Entity() {
  return (target: Function) => {
    Reflect.defineMetadata('DDD:Entity', true, target);
  };
}
