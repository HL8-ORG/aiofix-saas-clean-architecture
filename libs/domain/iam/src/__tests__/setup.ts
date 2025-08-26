/**
 * @file setup.ts
 * @description 测试设置文件
 */

// 设置测试环境
process.env.NODE_ENV = 'test';

// 设置时区
process.env.TZ = 'UTC';

// 设置Jest超时时间
jest.setTimeout(10000);

// 全局测试工具函数
(global as Record<string, unknown>).testUtils = {
  // 生成随机字符串
  randomString: (length: number = 10): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // 生成随机邮箱
  randomEmail: (): string => {
    return `test.${Date.now()}@example.com`;
  },

  // 生成随机用户名
  randomUsername: (): string => {
    return `user_${Date.now()}`;
  },

  // 等待指定时间
  wait: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
