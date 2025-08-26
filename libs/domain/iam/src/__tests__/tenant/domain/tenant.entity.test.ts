/**
 * @file tenant.entity.test.ts
 * @description 租户实体单元测试
 */

import {
  Tenant,
  TenantStatus,
} from '../../../tenant/domain/entities/tenant.entity';
import { TenantCode } from '../../../tenant/domain/value-objects/tenant-code.vo';
import { Uuid } from '@aiofix/domain-shared';

describe('Tenant', () => {
  let tenantId: Uuid;
  let tenantCode: TenantCode;
  let tenant: Tenant;

  beforeEach(() => {
    tenantId = Uuid.generate();
    tenantCode = new TenantCode('test001');
    tenant = new Tenant(
      tenantId,
      tenantCode,
      'Test Company',
      TenantStatus.ACTIVE,
    );
  });

  describe('构造函数', () => {
    it('应该成功创建租户', () => {
      expect(tenant.id).toBe(tenantId);
      expect(tenant.code).toBe(tenantCode);
      expect(tenant.name).toBe('Test Company');
      expect(tenant.status).toBe(TenantStatus.ACTIVE);
    });

    it('应该设置默认值', () => {
      expect(tenant.maxUsers).toBe(100);
      expect(tenant.maxOrganizations).toBe(10);
    });

    it('应该支持自定义参数', () => {
      const customTenant = new Tenant(
        tenantId,
        tenantCode,
        'Custom Company',
        TenantStatus.PENDING,
        200,
        20,
        'Custom description',
        'test@example.com',
        '+1234567890',
      );
      expect(customTenant.name).toBe('Custom Company');
      expect(customTenant.status).toBe(TenantStatus.PENDING);
      expect(customTenant.maxUsers).toBe(200);
      expect(customTenant.maxOrganizations).toBe(20);
      expect(customTenant.description).toBe('Custom description');
      expect(customTenant.contactEmail).toBe('test@example.com');
      expect(customTenant.contactPhone).toBe('+1234567890');
    });
  });

  describe('状态管理', () => {
    it('应该能够激活租户', () => {
      tenant.suspend();
      expect(tenant.status).toBe(TenantStatus.SUSPENDED);

      tenant.activate();
      expect(tenant.status).toBe(TenantStatus.ACTIVE);
    });

    it('应该能够暂停租户', () => {
      tenant.suspend();
      expect(tenant.status).toBe(TenantStatus.SUSPENDED);
    });

    it('应该能够禁用租户', () => {
      tenant.disable();
      expect(tenant.status).toBe(TenantStatus.DISABLED);
    });
  });

  describe('信息更新', () => {
    it('应该能够更新租户名称', () => {
      tenant.updateName('New Company Name');
      expect(tenant.name).toBe('New Company Name');
    });

    it('应该抛出错误当名称为空', () => {
      expect(() => tenant.updateName('')).toThrow(
        'Tenant name cannot be empty',
      );
    });

    it('应该能够更新租户描述', () => {
      tenant.updateDescription('New description');
      expect(tenant.description).toBe('New description');
    });

    it('应该能够清除租户描述', () => {
      tenant.updateDescription('Some description');
      tenant.updateDescription();
      expect(tenant.description).toBeUndefined();
    });
  });

  describe('联系信息管理', () => {
    it('应该能够更新联系信息', () => {
      tenant.updateContactInfo('new@example.com', '+1234567890');
      expect(tenant.contactEmail).toBe('new@example.com');
      expect(tenant.contactPhone).toBe('+1234567890');
    });

    it('应该能够部分更新联系信息', () => {
      tenant.updateContactInfo('new@example.com');
      expect(tenant.contactEmail).toBe('new@example.com');
      expect(tenant.contactPhone).toBeUndefined();
    });
  });

  describe('限制管理', () => {
    it('应该能够更新限制', () => {
      tenant.updateLimits(200, 20);
      expect(tenant.maxUsers).toBe(200);
      expect(tenant.maxOrganizations).toBe(20);
    });
  });

  describe('设置管理', () => {
    it('应该能够获取和设置设置项', () => {
      tenant.setSetting('allowUserRegistration', true);
      expect(tenant.getSetting('allowUserRegistration')).toBe(true);
    });

    it('应该能够更新设置', () => {
      const settings = {
        allowUserRegistration: false,
        requireApproval: true,
      };
      tenant.updateSettings(settings);
      expect(tenant.getSetting('allowUserRegistration')).toBe(false);
      expect(tenant.getSetting('requireApproval')).toBe(true);
    });
  });

  describe('业务规则检查', () => {
    it('应该检查用户限制', () => {
      expect(tenant.maxUsers).toBe(100);

      // 更新用户限制
      tenant.updateLimits(50, 10);
      expect(tenant.maxUsers).toBe(50);
    });

    it('应该检查组织限制', () => {
      expect(tenant.maxOrganizations).toBe(10);

      // 更新组织限制
      tenant.updateLimits(100, 20);
      expect(tenant.maxOrganizations).toBe(20);
    });
  });
});
