/**
 * @class TenantAwareEntity
 * @description 支持多租户隔离的实体基类
 * @extends BaseEntity
 * @rule 跨租户操作必须显式检查
 */
export abstract class TenantAwareEntity extends BaseEntity {
  constructor(
    public readonly tenantId: Uuid,
    id?: Uuid,
  ) {
    super(id);
  }

  /**
   * @method assertSameTenant
   * @description 断言目标对象属于同一租户
   * @param other 目标领域对象
   * @throws {TenantAccessDeniedError} 租户不匹配时抛出
   */
  protected assertSameTenant(other: TenantAwareEntity): void {
    if (!this.tenantId.equals(other.tenantId)) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体属于租户${this.tenantId}，目标属于${other.tenantId}`,
      );
    }
  }

  /**
   * @method canAccess
   * @description 检查当前租户是否有权限访问目标对象
   * @param target 目标领域对象
   * @returns 是否允许访问
   */
  public canAccess(target: TenantAwareEntity): boolean {
    return this.tenantId.equals(target.tenantId);
  }
}
