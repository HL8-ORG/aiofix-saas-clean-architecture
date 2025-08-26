/**
 * @class TenantAccessDeniedError
 * @description 租户访问被拒绝异常
 * @extends Error
 */
export class TenantAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantAccessDeniedError';
  }
}
