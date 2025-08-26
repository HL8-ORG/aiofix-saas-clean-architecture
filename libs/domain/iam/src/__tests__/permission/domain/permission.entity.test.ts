/**
 * @file permission.entity.test.ts
 * @description 权限实体单元测试
 */

import {
  Permission,
  PermissionStatus,
  PermissionType,
  PermissionScope,
  PermissionAction,
} from '../../../permission/domain/entities/permission.entity';
import { PermissionCode } from '../../../permission/domain/value-objects/permission-code.vo';
import { Uuid } from '@aiofix/domain-shared';

describe('Permission', () => {
  let permissionId: Uuid;
  let _tenantId: Uuid;
  let organizationId: Uuid;
  let code: PermissionCode;
  let permission: Permission;

  beforeEach(() => {
    permissionId = Uuid.generate();
    _tenantId = Uuid.generate();
    organizationId = Uuid.generate();
    code = new PermissionCode('user:read:global');
    permission = new Permission(
      permissionId,
      code,
      'User Read Permission',
      organizationId,
      PermissionType.SYSTEM,
      PermissionScope.GLOBAL,
      PermissionAction.READ,
      { type: 'data', name: 'user', path: '/api/users' },
    );
  });

  describe('构造函数', () => {
    it('应该成功创建权限', () => {
      expect(permission.id).toBe(permissionId);
      expect(permission.organizationId).toBe(organizationId);
      expect(permission.organizationId).toBe(organizationId);
      expect(permission.code).toBe(code);
      expect(permission.name).toBe('User Read Permission');
      expect(permission.status).toBe(PermissionStatus.ACTIVE);
      expect(permission.type).toBe(PermissionType.SYSTEM);
      expect(permission.scope).toBe(PermissionScope.GLOBAL);
      expect(permission.action).toBe(PermissionAction.READ);
    });

    it('应该设置默认值', () => {
      expect(permission.isActive).toBe(true);
      expect(permission.isRoot).toBe(true);
      expect(permission.hasChildren).toBe(false);
      expect(permission.roleCount).toBe(0);
      expect(permission.userCount).toBe(0);
    });
  });

  describe('状态管理', () => {
    it('应该能够激活权限', () => {
      permission.suspend();
      permission.activate();
      expect(permission.status).toBe(PermissionStatus.ACTIVE);
      expect(permission.isActive).toBe(true);
    });

    it('应该能够暂停权限', () => {
      permission.suspend();
      expect(permission.status).toBe(PermissionStatus.SUSPENDED);
      expect(permission.isActive).toBe(false);
    });

    it('应该能够禁用权限', () => {
      permission.disable();
      expect(permission.status).toBe(PermissionStatus.DISABLED);
      expect(permission.isActive).toBe(false);
    });
  });

  describe('信息更新', () => {
    it('应该能够更新名称', () => {
      permission.updateName('Updated Permission');
      expect(permission.name).toBe('Updated Permission');
    });

    it('应该能够更新描述', () => {
      permission.updateDescription('An updated description');
      expect(permission.description).toBe('An updated description');
    });

    it('应该能够更新类型', () => {
      permission.updateType(PermissionType.CUSTOM);
      expect(permission.type).toBe(PermissionType.CUSTOM);
    });

    it('应该能够更新范围', () => {
      permission.updateScope(PermissionScope.ORGANIZATION);
      expect(permission.scope).toBe(PermissionScope.ORGANIZATION);
    });

    it('应该能够更新操作', () => {
      permission.updateAction(PermissionAction.WRITE);
      expect(permission.action).toBe(PermissionAction.WRITE);
    });
  });

  describe('角色管理', () => {
    it('应该能够添加角色', () => {
      const roleId = Uuid.generate();
      permission.addRole(roleId);
      expect(permission.roles).toContain(roleId);
      expect(permission.roleCount).toBe(1);
    });

    it('应该能够移除角色', () => {
      const roleId = Uuid.generate();
      permission.addRole(roleId);
      permission.removeRole(roleId);
      expect(permission.roles).not.toContain(roleId);
      expect(permission.roleCount).toBe(0);
    });

    it('应该能够检查角色是否存在', () => {
      const roleId = Uuid.generate();
      expect(permission.hasRole(roleId)).toBe(false);

      permission.addRole(roleId);
      expect(permission.hasRole(roleId)).toBe(true);
    });
  });

  describe('用户管理', () => {
    it('应该能够添加用户', () => {
      const userId = Uuid.generate();
      permission.addUser(userId);
      expect(permission.users).toContain(userId);
      expect(permission.userCount).toBe(1);
    });

    it('应该能够移除用户', () => {
      const userId = Uuid.generate();
      permission.addUser(userId);
      permission.removeUser(userId);
      expect(permission.users).not.toContain(userId);
      expect(permission.userCount).toBe(0);
    });

    it('应该能够检查用户是否存在', () => {
      const userId = Uuid.generate();
      expect(permission.hasUser(userId)).toBe(false);

      permission.addUser(userId);
      expect(permission.hasUser(userId)).toBe(true);
    });
  });
});
