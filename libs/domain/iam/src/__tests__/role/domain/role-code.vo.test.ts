/**
 * @file role-code.vo.test.ts
 * @description 角色代码值对象单元测试
 */

import { RoleCode } from '../../../role/domain/value-objects/role-code.vo';

describe('RoleCode', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的角色代码', () => {
      const code = new RoleCode('MANAGER');
      expect(code.value).toBe('MANAGER');
    });

    it('应该自动转换为大写', () => {
      const code = new RoleCode('manager');
      expect(code.value).toBe('MANAGER');
    });

    it('应该抛出错误当代码为空', () => {
      expect(() => new RoleCode('')).toThrow('角色代码不能为空');
    });

    it('应该抛出错误当代码长度小于3个字符', () => {
      expect(() => new RoleCode('AB')).toThrow('角色代码长度不能少于3个字符');
    });

    it('应该抛出错误当代码长度超过20个字符', () => {
      expect(() => new RoleCode('A'.repeat(21))).toThrow(
        '角色代码长度不能超过20个字符',
      );
    });
  });

  describe('toString', () => {
    it('应该返回字符串值', () => {
      const code = new RoleCode('MANAGER');
      expect(code.toString()).toBe('MANAGER');
    });
  });

  describe('equals', () => {
    it('应该正确比较两个角色代码', () => {
      const code1 = new RoleCode('MANAGER');
      const code2 = new RoleCode('MANAGER');
      const code3 = new RoleCode('DEVELOPER');

      expect(code1.equals(code2)).toBe(true);
      expect(code1.equals(code3)).toBe(false);
    });

    it('应该处理null和undefined', () => {
      const code = new RoleCode('MANAGER');
      expect(code.equals(null as unknown as RoleCode)).toBe(false);
      expect(code.equals(undefined as unknown as RoleCode)).toBe(false);
    });
  });

  describe('fromString', () => {
    it('应该从字符串创建角色代码', () => {
      const code = RoleCode.fromString('MANAGER');
      expect(code.value).toBe('MANAGER');
    });
  });
});
