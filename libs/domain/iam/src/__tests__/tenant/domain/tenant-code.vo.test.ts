/**
 * @file tenant-code.vo.test.ts
 * @description 租户代码值对象单元测试
 */

import { TenantCode } from '../../../tenant/domain/value-objects/tenant-code.vo';

describe('TenantCode', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的租户代码', () => {
      const code = new TenantCode('test001');
      expect(code.value).toBe('test001');
    });

    it('应该将代码转换为小写', () => {
      const code = new TenantCode('TEST001');
      expect(code.value).toBe('test001');
    });

    it('应该抛出错误当代码为空', () => {
      expect(() => new TenantCode('')).toThrow('Tenant code cannot be empty');
    });

    it('应该抛出错误当代码长度少于3个字符', () => {
      expect(() => new TenantCode('ab')).toThrow(
        'Tenant code must be at least 3 characters long',
      );
    });

    it('应该抛出错误当代码长度超过20个字符', () => {
      expect(() => new TenantCode('a'.repeat(21))).toThrow(
        'Tenant code cannot exceed 20 characters',
      );
    });

    it('应该抛出错误当代码包含无效字符', () => {
      expect(() => new TenantCode('test@001')).toThrow(
        'Tenant code can only contain letters, numbers, and hyphens',
      );
      expect(() => new TenantCode('test 001')).toThrow(
        'Tenant code can only contain letters, numbers, and hyphens',
      );
    });

    it('应该抛出错误当代码以连字符开头或结尾', () => {
      expect(() => new TenantCode('-test001')).toThrow(
        'Tenant code cannot start or end with a hyphen',
      );
      expect(() => new TenantCode('test001-')).toThrow(
        'Tenant code cannot start or end with a hyphen',
      );
    });

    it('应该抛出错误当代码包含连续连字符', () => {
      expect(() => new TenantCode('test--001')).toThrow(
        'Tenant code cannot contain consecutive hyphens',
      );
    });
  });

  describe('toString', () => {
    it('应该返回代码字符串', () => {
      const code = new TenantCode('test001');
      expect(code.toString()).toBe('test001');
    });
  });

  describe('equals', () => {
    it('应该正确比较两个相同的代码', () => {
      const code1 = new TenantCode('test001');
      const code2 = new TenantCode('test001');
      expect(code1.equals(code2)).toBe(true);
    });

    it('应该正确比较两个不同的代码', () => {
      const code1 = new TenantCode('test001');
      const code2 = new TenantCode('test002');
      expect(code1.equals(code2)).toBe(false);
    });

    it('应该忽略大小写进行比较', () => {
      const code1 = new TenantCode('TEST001');
      const code2 = new TenantCode('test001');
      expect(code1.equals(code2)).toBe(true);
    });

    it('应该处理null和undefined', () => {
      const code1 = new TenantCode('test001');
      expect(code1.equals(null as unknown as TenantCode)).toBe(false);
      expect(code1.equals(undefined as unknown as TenantCode)).toBe(false);
    });
  });
});
