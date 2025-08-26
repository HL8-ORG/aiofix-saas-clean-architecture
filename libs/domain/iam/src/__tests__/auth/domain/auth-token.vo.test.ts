/**
 * @file auth-token.vo.test.ts
 * @description 认证令牌值对象单元测试
 */

import { AuthToken } from '../../../auth/domain/value-objects/auth-token.vo';

describe('AuthToken', () => {
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  describe('构造函数', () => {
    it('应该成功创建有效的认证令牌', () => {
      const token = new AuthToken(validToken);
      expect(token.value).toBe(validToken);
    });

    it('应该设置默认类型和过期时间', () => {
      const token = new AuthToken(validToken);
      expect(token.type).toBe('jwt');
      expect(token.expiresAt).toBeInstanceOf(Date);
    });

    it('应该抛出错误当令牌为空', () => {
      expect(() => new AuthToken('')).toThrow('认证令牌不能为空');
      expect(() => new AuthToken('   ')).toThrow('认证令牌不能为空');
    });

    it('应该抛出错误当令牌长度少于32个字符', () => {
      expect(() => new AuthToken('short')).toThrow(
        '认证令牌长度不能少于32个字符',
      );
    });

    it('应该抛出错误当令牌长度超过512个字符', () => {
      expect(() => new AuthToken('a'.repeat(513))).toThrow(
        '认证令牌长度不能超过512个字符',
      );
    });

    it('应该抛出错误当令牌包含无效字符', () => {
      const invalidToken = 'test token with spaces' + 'a'.repeat(20);
      expect(() => new AuthToken(invalidToken)).toThrow(
        '认证令牌只能包含字母、数字、连字符、下划线、点号和等号',
      );

      const invalidToken2 = 'test+token+with+plus' + 'a'.repeat(20);
      expect(() => new AuthToken(invalidToken2)).toThrow(
        '认证令牌只能包含字母、数字、连字符、下划线、点号和等号',
      );
    });

    it('应该抛出错误当令牌是纯数字', () => {
      expect(() => new AuthToken('1'.repeat(32))).toThrow(
        '认证令牌不能是纯数字',
      );
    });
  });

  describe('toString', () => {
    it('应该返回令牌字符串', () => {
      const token = new AuthToken(validToken);
      expect(token.toString()).toBe(validToken);
    });
  });

  describe('equals', () => {
    it('应该正确比较两个相同的令牌', () => {
      const token1 = new AuthToken(validToken);
      const token2 = new AuthToken(validToken);
      expect(token1.equals(token2)).toBe(true);
    });

    it('应该正确比较两个不同的令牌', () => {
      const token1 = new AuthToken(validToken);
      const token2 = new AuthToken(validToken + 'different');
      expect(token1.equals(token2)).toBe(false);
    });
  });

  describe('过期时间管理', () => {
    it('应该检查令牌是否已过期', () => {
      const expiredToken = new AuthToken(
        validToken,
        'jwt',
        new Date(Date.now() - 1000),
      );
      expect(expiredToken.isExpired()).toBe(true);

      const validTokenObj = new AuthToken(
        validToken,
        'jwt',
        new Date(Date.now() + 1000),
      );
      expect(validTokenObj.isExpired()).toBe(false);
    });

    it('应该检查令牌是否即将过期', () => {
      const expiringToken = new AuthToken(
        validToken,
        'jwt',
        new Date(Date.now() + 15 * 60 * 1000),
      );
      expect(expiringToken.isExpiringSoon(30)).toBe(true);

      const validTokenObj = new AuthToken(
        validToken,
        'jwt',
        new Date(Date.now() + 60 * 60 * 1000),
      );
      expect(validTokenObj.isExpiringSoon(30)).toBe(false);
    });

    it('应该获取剩余时间', () => {
      const futureTime = Date.now() + 60 * 60 * 1000; // 1小时后
      const token = new AuthToken(validToken, 'jwt', new Date(futureTime));
      const remainingTime = token.getRemainingTime();
      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(60 * 60 * 1000);
    });

    it('应该获取剩余分钟数', () => {
      const futureTime = Date.now() + 120 * 60 * 1000; // 2小时后
      const token = new AuthToken(validToken, 'jwt', new Date(futureTime));
      const remainingMinutes = token.getRemainingMinutes();
      expect(remainingMinutes).toBeGreaterThan(0);
      expect(remainingMinutes).toBeLessThanOrEqual(120);
    });
  });

  describe('fromString', () => {
    it('应该从字符串创建认证令牌', () => {
      const token = AuthToken.fromString(validToken);
      expect(token.value).toBe(validToken);
    });

    it('应该支持自定义类型和过期时间', () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const token = AuthToken.fromString(validToken, 'access', expiresAt);
      expect(token.type).toBe('access');
      expect(token.expiresAt).toEqual(expiresAt);
    });
  });

  describe('generate', () => {
    it('应该生成随机认证令牌', () => {
      const token = AuthToken.generate('jwt', 60);
      expect(token.type).toBe('jwt');
      expect(token.value).toMatch(/^[A-Za-z0-9\-_.=]+$/);
      expect(token.value.length).toBeGreaterThanOrEqual(32);
    });

    it('应该使用默认参数', () => {
      const token = AuthToken.generate();
      expect(token.type).toBe('jwt');
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('应该处理无效的长度参数', () => {
      const token = AuthToken.generate('jwt', 0);
      expect(token.value.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('特定令牌类型生成', () => {
    it('应该生成访问令牌', () => {
      const token = AuthToken.generateAccessToken(30);
      expect(token.type).toBe('access');
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('应该生成刷新令牌', () => {
      const token = AuthToken.generateRefreshToken(1440);
      expect(token.type).toBe('refresh');
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('应该生成API令牌', () => {
      const token = AuthToken.generateApiToken(1440);
      expect(token.type).toBe('api');
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('应该生成会话令牌', () => {
      const token = AuthToken.generateSessionToken(480);
      expect(token.type).toBe('session');
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
