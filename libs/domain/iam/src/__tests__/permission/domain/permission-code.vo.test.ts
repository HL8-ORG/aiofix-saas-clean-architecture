/**
 * @file permission-code.vo.test.ts
 * @description 权限代码值对象单元测试
 */

import { PermissionCode } from '../../../permission/domain/value-objects/permission-code.vo';

describe('PermissionCode', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的权限代码', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.value).toBe('user:read:global');
    });

    it('应该抛出错误当代码为空', () => {
      expect(() => new PermissionCode('')).toThrow('权限代码不能为空');
    });

    it('应该抛出错误当代码长度小于3个字符', () => {
      expect(() => new PermissionCode('AB')).toThrow(
        '权限代码长度不能少于3个字符',
      );
    });

    it('应该抛出错误当代码长度超过50个字符', () => {
      expect(() => new PermissionCode('A'.repeat(51))).toThrow(
        '权限代码长度不能超过50个字符',
      );
    });
  });

  describe('toString', () => {
    it('应该返回字符串值', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.toString()).toBe('user:read:global');
    });
  });

  describe('equals', () => {
    it('应该正确比较两个权限代码', () => {
      const code1 = new PermissionCode('user:read:global');
      const code2 = new PermissionCode('user:read:global');
      const code3 = new PermissionCode('user:write:global');

      expect(code1.equals(code2)).toBe(true);
      expect(code1.equals(code3)).toBe(false);
    });

    it('应该处理null和undefined', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.equals(null as unknown as PermissionCode)).toBe(false);
      expect(code.equals(undefined as unknown as PermissionCode)).toBe(false);
    });
  });

  describe('getResource', () => {
    it('应该正确提取资源部分', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.getResource()).toBe('user');
    });
  });

  describe('getAction', () => {
    it('应该正确提取操作部分', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.getAction()).toBe('read');
    });
  });

  describe('getScope', () => {
    it('应该正确提取范围部分', () => {
      const code = new PermissionCode('user:read:global');
      expect(code.getScope()).toBe('global');
    });
  });

  describe('fromString', () => {
    it('应该从字符串创建权限代码', () => {
      const code = PermissionCode.fromString('user:read:global');
      expect(code.value).toBe('user:read:global');
    });
  });

  describe('generateFromResource', () => {
    it('应该从资源生成权限代码', () => {
      const code = PermissionCode.generateFromResource(
        'user',
        'read',
        'global',
      );
      expect(code.value).toBe('user:read:global');
    });
  });

  describe('预定义权限方法', () => {
    it('应该创建读取权限', () => {
      const code = PermissionCode.createReadPermission('user', 'global');
      expect(code.value).toBe('user:read:global');
    });

    it('应该创建写入权限', () => {
      const code = PermissionCode.createWritePermission('user', 'global');
      expect(code.value).toBe('user:write:global');
    });

    it('应该创建删除权限', () => {
      const code = PermissionCode.createDeletePermission('user', 'global');
      expect(code.value).toBe('user:delete:global');
    });

    it('应该创建执行权限', () => {
      const code = PermissionCode.createExecutePermission('user', 'global');
      expect(code.value).toBe('user:execute:global');
    });
  });
});
