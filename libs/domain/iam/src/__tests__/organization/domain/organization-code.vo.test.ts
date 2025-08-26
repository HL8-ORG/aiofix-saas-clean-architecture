/**
 * @file organization-code.vo.test.ts
 * @description 组织代码值对象单元测试
 */

import { OrganizationCode } from '../../../organization/domain/value-objects/organization-code.vo';

describe('OrganizationCode', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的组织代码', () => {
      const code = new OrganizationCode('ORG001');
      expect(code.value).toBe('ORG001');
    });

    it('应该自动转换为大写', () => {
      const code = new OrganizationCode('org001');
      expect(code.value).toBe('ORG001');
    });

    it('应该抛出错误当代码为空', () => {
      expect(() => new OrganizationCode('')).toThrow('组织代码不能为空');
    });

    it('应该抛出错误当代码长度小于3个字符', () => {
      expect(() => new OrganizationCode('AB')).toThrow(
        '组织代码长度不能少于3个字符',
      );
    });

    it('应该抛出错误当代码长度超过20个字符', () => {
      expect(() => new OrganizationCode('A'.repeat(21))).toThrow(
        '组织代码长度不能超过20个字符',
      );
    });
  });

  describe('toString', () => {
    it('应该返回字符串值', () => {
      const code = new OrganizationCode('ORG001');
      expect(code.toString()).toBe('ORG001');
    });
  });

  describe('equals', () => {
    it('应该正确比较两个组织代码', () => {
      const code1 = new OrganizationCode('ORG001');
      const code2 = new OrganizationCode('ORG001');
      const code3 = new OrganizationCode('ORG002');

      expect(code1.equals(code2)).toBe(true);
      expect(code1.equals(code3)).toBe(false);
    });

    it('应该处理null和undefined', () => {
      const code = new OrganizationCode('ORG001');
      expect(code.equals(null as unknown as OrganizationCode)).toBe(false);
      expect(code.equals(undefined as unknown as OrganizationCode)).toBe(false);
    });
  });

  describe('fromString', () => {
    it('应该从字符串创建组织代码', () => {
      const code = OrganizationCode.fromString('ORG001');
      expect(code.value).toBe('ORG001');
    });
  });
});
