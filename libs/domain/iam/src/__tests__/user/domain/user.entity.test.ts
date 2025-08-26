/**
 * @file user.entity.test.ts
 * @description 用户实体单元测试
 */

import {
  User,
  UserStatus,
  UserType,
} from '../../../user/domain/entities/user.entity';
import { Username } from '../../../user/domain/value-objects/username.vo';
import { Email } from '../../../user/domain/value-objects/email.vo';
import { Password } from '../../../user/domain/value-objects/password.vo';
import { Uuid } from '@aiofix/domain-shared';

describe('User', () => {
  let userId: Uuid;
  let tenantId: Uuid;
  let organizationId: Uuid;
  let username: Username;
  let email: Email;
  let password: Password;
  let user: User;

  beforeEach(() => {
    userId = Uuid.generate();
    tenantId = Uuid.generate();
    organizationId = Uuid.generate();
    username = new Username('john_doe');
    email = new Email('john.doe@example.com');
    password = new Password('MySecurePassword123!');
    user = new User(
      userId,
      username,
      email,
      password,
      tenantId,
      organizationId,
    );
  });

  describe('构造函数', () => {
    it('应该成功创建用户', () => {
      expect(user.id).toBe(userId);
      expect(user.tenantId).toBe(tenantId);
      expect(user.organizationId).toBe(organizationId);
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.status).toBe(UserStatus.PENDING);
      expect(user.type).toBe(UserType.INTERNAL);
    });

    it('应该设置默认值', () => {
      expect(user.isActive).toBe(false);
      expect(user.isLocked).toBe(false);
      expect(user.roleIds.length).toBe(0);
      expect(user.departmentIds.length).toBe(0);
    });

    it('应该支持自定义参数', () => {
      const customUser = new User(
        userId,
        username,
        email,
        password,
        tenantId,
        organizationId,
        UserType.EXTERNAL,
      );
      expect(customUser.status).toBe(UserStatus.PENDING);
      expect(customUser.type).toBe(UserType.EXTERNAL);
    });
  });

  describe('状态管理', () => {
    it('应该能够激活用户', () => {
      user.activate();
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.isActive).toBe(true);
    });

    it('应该能够暂停用户', () => {
      user.activate();
      user.suspend();
      expect(user.status).toBe(UserStatus.SUSPENDED);
      expect(user.isActive).toBe(false);
    });

    it('应该能够锁定用户', () => {
      user.lock();
      expect(user.status).toBe(UserStatus.LOCKED);
      expect(user.isLocked).toBe(true);
    });

    it('应该能够禁用用户', () => {
      user.disable();
      expect(user.status).toBe(UserStatus.DISABLED);
      expect(user.isActive).toBe(false);
    });
  });

  describe('信息更新', () => {
    it('应该能够更新用户档案', () => {
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        address: '123 Main St',
      };
      user.updateProfile(profile);
      expect(user.profile.firstName).toBe('John');
      expect(user.profile.lastName).toBe('Doe');
      expect(user.profile.phone).toBe('+1234567890');
      expect(user.profile.address).toBe('123 Main St');
    });
  });

  describe('角色管理', () => {
    it('应该能够分配角色', () => {
      const roleId = Uuid.generate();
      user.assignRole(roleId);
      expect(user.roleIds).toContain(roleId);
    });

    it('应该能够移除角色', () => {
      const roleId = Uuid.generate();
      user.assignRole(roleId);
      user.removeRole(roleId);
      expect(user.roleIds).not.toContain(roleId);
    });

    it('应该能够检查角色是否存在', () => {
      const roleId = Uuid.generate();
      expect(user.hasRole(roleId)).toBe(false);

      user.assignRole(roleId);
      expect(user.hasRole(roleId)).toBe(true);
    });

    it('应该防止重复分配角色', () => {
      const roleId = Uuid.generate();
      user.assignRole(roleId);
      user.assignRole(roleId);
      expect(user.roleIds.filter(id => id.equals(roleId)).length).toBe(1);
    });
  });

  describe('部门管理', () => {
    it('应该能够添加到部门', () => {
      const departmentId = Uuid.generate();
      user.addToDepartment(departmentId);
      expect(user.departmentIds).toContain(departmentId);
    });

    it('应该能够从部门移除', () => {
      const departmentId = Uuid.generate();
      user.addToDepartment(departmentId);
      user.removeFromDepartment(departmentId);
      expect(user.departmentIds).not.toContain(departmentId);
    });
  });

  describe('登录记录管理', () => {
    it('应该能够记录登录', () => {
      user.recordLogin('192.168.1.1', 'Mozilla/5.0', true);
      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });

    it('应该能够记录失败的登录', () => {
      user.recordLogin('192.168.1.1', 'Mozilla/5.0', false, 'Invalid password');
      expect(user.lastLoginAt).toBeUndefined();
    });
  });

  describe('设置管理', () => {
    it('应该能够更新设置', () => {
      const settings = {
        emailNotifications: false,
        smsNotifications: true,
        twoFactorEnabled: true,
      };
      user.updateSettings(settings);
      expect(user.settings.emailNotifications).toBe(false);
      expect(user.settings.smsNotifications).toBe(true);
      expect(user.settings.twoFactorEnabled).toBe(true);
    });

    it('应该能够获取和设置单个设置项', () => {
      user.setSetting('emailNotifications', false);
      expect(user.getSetting('emailNotifications')).toBe(false);
    });
  });

  describe('业务规则检查', () => {
    it('应该检查用户状态', () => {
      expect(user.isActive).toBe(false);

      user.activate();
      expect(user.isActive).toBe(true);
    });

    it('应该检查用户锁定状态', () => {
      expect(user.isLocked).toBe(false);

      user.lock();
      expect(user.isLocked).toBe(true);
    });
  });
});
