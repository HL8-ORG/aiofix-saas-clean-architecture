/**
 * @file username.vo.test.ts
 * @description 用户名值对象单元测试
 */

import { Username } from '../../../user/domain/value-objects/username.vo';

describe('Username', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的用户名', () => {
      const username = new Username('john_doe');
      expect(username.value).toBe('john_doe');
    });

    it('应该抛出错误当用户名为空', () => {
      expect(() => new Username('')).toThrow('用户名不能为空');
      expect(() => new Username('   ')).toThrow('用户名不能为空');
    });

    it('应该抛出错误当用户名长度少于3个字符', () => {
      expect(() => new Username('ab')).toThrow('用户名长度不能少于3个字符');
    });

    it('应该抛出错误当用户名长度超过30个字符', () => {
      expect(() => new Username('a'.repeat(31))).toThrow(
        '用户名长度不能超过30个字符',
      );
    });

    it('应该抛出错误当用户名包含无效字符', () => {
      expect(() => new Username('john@doe')).toThrow(
        '用户名只能包含字母、数字、连字符和下划线',
      );
      expect(() => new Username('john doe')).toThrow(
        '用户名只能包含字母、数字、连字符和下划线',
      );
    });

    it('应该抛出错误当用户名以连字符或下划线开头', () => {
      expect(() => new Username('-john')).toThrow(
        '用户名不能以连字符或下划线开头或结尾',
      );
      expect(() => new Username('_john')).toThrow(
        '用户名不能以连字符或下划线开头或结尾',
      );
    });

    it('应该抛出错误当用户名以连字符或下划线结尾', () => {
      expect(() => new Username('john-')).toThrow(
        '用户名不能以连字符或下划线开头或结尾',
      );
      expect(() => new Username('john_')).toThrow(
        '用户名不能以连字符或下划线开头或结尾',
      );
    });

    it('应该抛出错误当用户名包含连续的连字符或下划线', () => {
      expect(() => new Username('john--doe')).toThrow(
        '用户名不能包含连续的连字符或下划线',
      );
      expect(() => new Username('john__doe')).toThrow(
        '用户名不能包含连续的连字符或下划线',
      );
      expect(() => new Username('john-_doe')).toThrow(
        '用户名不能包含连续的连字符或下划线',
      );
      expect(() => new Username('john_-doe')).toThrow(
        '用户名不能包含连续的连字符或下划线',
      );
    });

    it('应该抛出错误当用户名是纯数字', () => {
      expect(() => new Username('123456')).toThrow('用户名不能是纯数字');
    });

    it('应该抛出错误当用户名是保留字', () => {
      expect(() => new Username('admin')).toThrow('用户名不能使用系统保留字');
      expect(() => new Username('SYSTEM')).toThrow('用户名不能使用系统保留字');
    });
  });

  describe('toString', () => {
    it('应该返回用户名字符串', () => {
      const username = new Username('john_doe');
      expect(username.toString()).toBe('john_doe');
    });
  });

  describe('equals', () => {
    it('应该正确比较两个相同的用户名', () => {
      const username1 = new Username('john_doe');
      const username2 = new Username('john_doe');
      expect(username1.equals(username2)).toBe(true);
    });

    it('应该正确比较两个不同的用户名', () => {
      const username1 = new Username('john_doe');
      const username2 = new Username('jane_doe');
      expect(username1.equals(username2)).toBe(false);
    });
  });

  describe('fromString', () => {
    it('应该从字符串创建用户名', () => {
      const username = Username.fromString('john_doe');
      expect(username.value).toBe('john_doe');
    });
  });

  describe('fromEmail', () => {
    it('应该从邮箱生成用户名', () => {
      const username = Username.fromEmail('john.doe@example.com');
      expect(username.value).toBe('johndoe');
    });

    it('应该处理包含特殊字符的邮箱', () => {
      const username = Username.fromEmail('john+test@example.com');
      expect(username.value).toBe('johntest');
    });

    it('应该处理过短的用户名', () => {
      const username = Username.fromEmail('ab@example.com');
      expect(username.value).toBe('abuser');
    });

    it('应该处理过长的用户名', () => {
      const longEmail = 'a'.repeat(25) + '@example.com';
      const username = Username.fromEmail(longEmail);
      expect(username.value.length).toBeLessThanOrEqual(30);
    });

    it('应该处理空邮箱', () => {
      expect(() => Username.fromEmail('')).toThrow('邮箱地址不能为空');
    });
  });

  describe('generate', () => {
    it('应该生成随机用户名', () => {
      const username = Username.generate('user', 8);
      expect(username.value.startsWith('user')).toBe(true);
      expect(username.value.length).toBe(8);
    });

    it('应该使用默认前缀和长度', () => {
      const username = Username.generate();
      expect(username.value.startsWith('user')).toBe(true);
      expect(username.value.length).toBe(8);
    });

    it('应该处理无效的长度参数', () => {
      const username = Username.generate('user', 2);
      expect(username.value.length).toBe(8); // 使用默认长度
    });
  });
});
