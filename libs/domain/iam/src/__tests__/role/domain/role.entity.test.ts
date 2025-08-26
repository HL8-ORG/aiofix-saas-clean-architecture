/**
 * @file role.entity.test.ts
 * @description 角色实体单元测试
 */

import {
  Role,
  RoleStatus,
  RoleType,
  RoleScope,
} from '../../../role/domain/entities/role.entity';
import { RoleCode } from '../../../role/domain/value-objects/role-code.vo';
import { Uuid } from '@aiofix/domain-shared';

describe('Role', () => {
  let roleId: Uuid;
  let _tenantId: Uuid;
  let organizationId: Uuid;
  let code: RoleCode;
  let role: Role;

  beforeEach(() => {
    roleId = Uuid.generate();
    _tenantId = Uuid.generate();
    organizationId = Uuid.generate();
    code = new RoleCode('MANAGER');
    role = new Role(roleId, code, 'Manager', organizationId);
  });

  describe('构造函数', () => {
    it('应该成功创建角色', () => {
      expect(role.id).toBe(roleId);
      expect(role.organizationId).toBe(organizationId);
      expect(role.organizationId).toBe(organizationId);
      expect(role.code).toBe(code);
      expect(role.name).toBe('Manager');
      expect(role.status).toBe(RoleStatus.ACTIVE);
      expect(role.type).toBe(RoleType.CUSTOM);
      expect(role.scope).toBe(RoleScope.ORGANIZATION);
    });

    it('应该设置默认值', () => {
      expect(role.isActive).toBe(true);
      expect(role.isRoot).toBe(true);
      expect(role.hasChildren).toBe(false);
      expect(role.memberCount).toBe(0);
    });
  });

  describe('状态管理', () => {
    it('应该能够激活角色', () => {
      role.suspend();
      role.activate();
      expect(role.status).toBe(RoleStatus.ACTIVE);
      expect(role.isActive).toBe(true);
    });

    it('应该能够暂停角色', () => {
      role.suspend();
      expect(role.status).toBe(RoleStatus.SUSPENDED);
      expect(role.isActive).toBe(false);
    });

    it('应该能够禁用角色', () => {
      role.disable();
      expect(role.status).toBe(RoleStatus.DISABLED);
      expect(role.isActive).toBe(false);
    });
  });

  describe('信息更新', () => {
    it('应该能够更新名称', () => {
      role.updateName('Updated Role');
      expect(role.name).toBe('Updated Role');
    });

    it('应该能够更新描述', () => {
      role.updateDescription('An updated description');
      expect(role.description).toBe('An updated description');
    });

    it('应该能够更新类型', () => {
      role.updateType(RoleType.CUSTOM);
      expect(role.type).toBe(RoleType.CUSTOM);
    });

    it('应该能够更新范围', () => {
      role.updateScope(RoleScope.GLOBAL);
      expect(role.scope).toBe(RoleScope.GLOBAL);
    });
  });

  describe('成员管理', () => {
    it('应该能够添加成员', () => {
      const memberId = Uuid.generate();
      role.addMember(memberId);
      expect(role.members).toContain(memberId);
      expect(role.memberCount).toBe(1);
    });

    it('应该能够移除成员', () => {
      const memberId = Uuid.generate();
      role.addMember(memberId);
      role.removeMember(memberId);
      expect(role.members).not.toContain(memberId);
      expect(role.memberCount).toBe(0);
    });

    it('应该能够检查成员是否存在', () => {
      const memberId = Uuid.generate();
      expect(role.hasMember(memberId)).toBe(false);

      role.addMember(memberId);
      expect(role.hasMember(memberId)).toBe(true);
    });
  });
});
