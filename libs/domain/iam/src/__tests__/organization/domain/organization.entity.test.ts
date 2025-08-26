/**
 * @file organization.entity.test.ts
 * @description 组织实体单元测试
 */

import {
  Organization,
  OrganizationStatus,
  OrganizationType,
} from '../../../organization/domain/entities/organization.entity';
import { OrganizationCode } from '../../../organization/domain/value-objects/organization-code.vo';
import { Uuid } from '@aiofix/domain-shared';

describe('Organization', () => {
  let organizationId: Uuid;
  let tenantId: Uuid;
  let code: OrganizationCode;
  let organization: Organization;

  beforeEach(() => {
    organizationId = Uuid.generate();
    tenantId = Uuid.generate();
    code = new OrganizationCode('ORG001');
    organization = new Organization(
      organizationId,
      code,
      'Test Organization',
      tenantId,
    );
  });

  describe('构造函数', () => {
    it('应该成功创建组织', () => {
      expect(organization.id).toBe(organizationId);
      expect(organization.tenantId).toBe(tenantId);
      expect(organization.code).toBe(code);
      expect(organization.name).toBe('Test Organization');
      expect(organization.status).toBe(OrganizationStatus.ACTIVE);
      expect(organization.type).toBe(OrganizationType.DEPARTMENT);
    });

    it('应该设置默认值', () => {
      expect(organization.isActive).toBe(true);
      expect(organization.isRoot).toBe(true);
      expect(organization.hasChildren).toBe(false);
      expect(organization.memberCount).toBe(0);
    });
  });

  describe('状态管理', () => {
    it('应该能够激活组织', () => {
      organization.suspend();
      organization.activate();
      expect(organization.status).toBe(OrganizationStatus.ACTIVE);
      expect(organization.isActive).toBe(true);
    });

    it('应该能够暂停组织', () => {
      organization.suspend();
      expect(organization.status).toBe(OrganizationStatus.SUSPENDED);
      expect(organization.isActive).toBe(false);
    });

    it('应该能够禁用组织', () => {
      organization.disable();
      expect(organization.status).toBe(OrganizationStatus.DISABLED);
      expect(organization.isActive).toBe(false);
    });
  });

  describe('信息更新', () => {
    it('应该能够更新名称', () => {
      organization.updateName('Updated Organization');
      expect(organization.name).toBe('Updated Organization');
    });

    it('应该能够更新描述', () => {
      organization.updateDescription('An updated description');
      expect(organization.description).toBe('An updated description');
    });

    it('应该能够更新类型', () => {
      organization.updateType(OrganizationType.COMPANY);
      expect(organization.type).toBe(OrganizationType.COMPANY);
    });
  });

  describe('成员管理', () => {
    it('应该能够添加成员', () => {
      const memberId = Uuid.generate();
      organization.addMember(memberId);
      expect(organization.members).toContain(memberId);
      expect(organization.memberCount).toBe(1);
    });

    it('应该能够移除成员', () => {
      const memberId = Uuid.generate();
      organization.addMember(memberId);
      organization.removeMember(memberId);
      expect(organization.members).not.toContain(memberId);
      expect(organization.memberCount).toBe(0);
    });

    it('应该能够检查成员是否存在', () => {
      const memberId = Uuid.generate();
      expect(organization.hasMember(memberId)).toBe(false);

      organization.addMember(memberId);
      expect(organization.hasMember(memberId)).toBe(true);
    });
  });
});
