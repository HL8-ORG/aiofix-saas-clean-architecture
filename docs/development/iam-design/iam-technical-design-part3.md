# IAM系统技术设计方案 - 第三部分

## 📋 文档信息

- **文档类型**: 技术设计方案 (第三部分)
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **更新日期**: 2024年12月
- **文档状态**: 初稿
- **目标读者**: 开发团队、架构师

---

## 🚀 缓存架构设计

### 缓存策略设计

#### 1. 多级缓存架构

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层缓存 (L1)                           │
│                   (内存缓存)                                │
├─────────────────────────────────────────────────────────────┤
│                    分布式缓存 (L2)                          │
│                   (Redis集群)                               │
├─────────────────────────────────────────────────────────────┤
│                    数据库缓存 (L3)                          │
│                   (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2. 缓存分类

- **用户会话缓存**: 存储用户登录状态和会话信息
- **权限缓存**: 存储用户权限和角色信息
- **组织架构缓存**: 存储组织架构树和部门关系
- **查询结果缓存**: 缓存常用查询结果
- **配置缓存**: 缓存系统配置和参数

### 缓存服务实现

#### 缓存服务接口

```typescript
/**
 * @interface ICacheService
 * @description 缓存服务接口
 */
export interface ICacheService {
  /**
   * @method get
   * @description 获取缓存值
   * @param key 缓存键
   * @returns 缓存值
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * @method set
   * @description 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间(秒)
   * @returns 设置结果
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * @method delete
   * @description 删除缓存
   * @param key 缓存键
   * @returns 删除结果
   */
  delete(key: string): Promise<void>;

  /**
   * @method clear
   * @description 清空缓存
   * @param pattern 匹配模式
   * @returns 清空结果
   */
  clear(pattern?: string): Promise<void>;

  /**
   * @method exists
   * @description 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  exists(key: string): Promise<boolean>;
}
```

#### Redis缓存服务实现

```typescript
/**
 * @class RedisCacheService
 * @description Redis缓存服务实现
 */
@Injectable()
export class RedisCacheService implements ICacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method get
   * @description 获取缓存值
   * @param key 缓存键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      this.logger.error('获取缓存失败', { error, key });
      return null;
    }
  }

  /**
   * @method set
   * @description 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间(秒)
   * @returns 设置结果
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redisService.setex(key, ttl, serializedValue);
      } else {
        await this.redisService.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error('设置缓存失败', { error, key });
      throw new CacheException('CACHE_SET_FAILED', '设置缓存失败');
    }
  }

  /**
   * @method delete
   * @description 删除缓存
   * @param key 缓存键
   * @returns 删除结果
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
    } catch (error) {
      this.logger.error('删除缓存失败', { error, key });
      throw new CacheException('CACHE_DELETE_FAILED', '删除缓存失败');
    }
  }

  /**
   * @method clear
   * @description 清空缓存
   * @param pattern 匹配模式
   * @returns 清空结果
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await this.redisService.keys(pattern);
        if (keys.length > 0) {
          await this.redisService.del(...keys);
        }
      } else {
        await this.redisService.flushdb();
      }
    } catch (error) {
      this.logger.error('清空缓存失败', { error, pattern });
      throw new CacheException('CACHE_CLEAR_FAILED', '清空缓存失败');
    }
  }

  /**
   * @method exists
   * @description 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('检查缓存存在性失败', { error, key });
      return false;
    }
  }
}
```

### 用户会话缓存管理

#### 会话缓存服务

```typescript
/**
 * @class UserSessionCacheService
 * @description 用户会话缓存服务
 */
@Injectable()
export class UserSessionCacheService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly SESSION_TTL = 3600; // 1小时

  constructor(
    private readonly cacheService: ICacheService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method createSession
   * @description 创建用户会话
   * @param userId 用户ID
   * @param sessionData 会话数据
   * @returns 会话ID
   */
  async createSession(
    userId: Uuid,
    sessionData: UserSessionData,
  ): Promise<string> {
    const sessionId = Uuid.generate().value;
    const key = this.getSessionKey(sessionId);

    const session = {
      id: sessionId,
      userId: userId.value,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    await this.cacheService.set(key, session, this.SESSION_TTL);

    this.logger.info('用户会话创建成功', { sessionId, userId: userId.value });

    return sessionId;
  }

  /**
   * @method getSession
   * @description 获取用户会话
   * @param sessionId 会话ID
   * @returns 会话数据
   */
  async getSession(sessionId: string): Promise<UserSessionData | null> {
    const key = this.getSessionKey(sessionId);
    const session = await this.cacheService.get<UserSessionData>(key);

    if (session) {
      // 更新最后访问时间
      session.lastAccessedAt = new Date().toISOString();
      await this.cacheService.set(key, session, this.SESSION_TTL);
    }

    return session;
  }

  /**
   * @method updateSession
   * @description 更新用户会话
   * @param sessionId 会话ID
   * @param sessionData 会话数据
   * @returns 更新结果
   */
  async updateSession(
    sessionId: string,
    sessionData: Partial<UserSessionData>,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.cacheService.get<UserSessionData>(key);

    if (!session) {
      throw new NotFoundException('SESSION_NOT_FOUND', '会话不存在');
    }

    const updatedSession = {
      ...session,
      ...sessionData,
      lastAccessedAt: new Date().toISOString(),
    };

    await this.cacheService.set(key, updatedSession, this.SESSION_TTL);
  }

  /**
   * @method deleteSession
   * @description 删除用户会话
   * @param sessionId 会话ID
   * @returns 删除结果
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    await this.cacheService.delete(key);

    this.logger.info('用户会话删除成功', { sessionId });
  }

  /**
   * @method getSessionKey
   * @description 获取会话缓存键
   * @param sessionId 会话ID
   * @returns 缓存键
   */
  private getSessionKey(sessionId: string): string {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }
}
```

---

## 📧 通知服务设计

### 通知服务架构

#### 通知服务组件

```
┌─────────────────────────────────────────────────────────────┐
│                    通知服务 (Notification Service)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  邮件服务   │  │  短信服务   │  │  推送服务   │         │
│  │Email Service│  │SMS Service  │  │Push Service │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    通知模板引擎                              │
├─────────────────────────────────────────────────────────────┤
│                    通知队列管理                              │
├─────────────────────────────────────────────────────────────┤
│                    通知状态跟踪                              │
└─────────────────────────────────────────────────────────────┘
```

### 通知服务实现

#### 通知服务接口

```typescript
/**
 * @interface INotificationService
 * @description 通知服务接口
 */
export interface INotificationService {
  /**
   * @method sendEmail
   * @description 发送邮件通知
   * @param notification 邮件通知
   * @returns 发送结果
   */
  sendEmail(notification: EmailNotification): Promise<NotificationResult>;

  /**
   * @method sendSMS
   * @description 发送短信通知
   * @param notification 短信通知
   * @returns 发送结果
   */
  sendSMS(notification: SMSNotification): Promise<NotificationResult>;

  /**
   * @method sendPush
   * @description 发送推送通知
   * @param notification 推送通知
   * @returns 发送结果
   */
  sendPush(notification: PushNotification): Promise<NotificationResult>;

  /**
   * @method sendMultiChannel
   * @description 多渠道发送通知
   * @param notification 多渠道通知
   * @returns 发送结果
   */
  sendMultiChannel(
    notification: MultiChannelNotification,
  ): Promise<NotificationResult[]>;
}
```

#### 通知服务实现

```typescript
/**
 * @class NotificationService
 * @description 通知服务实现
 */
@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
    private readonly pushService: PushService,
    private readonly templateEngine: TemplateEngine,
    private readonly notificationQueue: NotificationQueue,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method sendEmail
   * @description 发送邮件通知
   * @param notification 邮件通知
   * @returns 发送结果
   */
  async sendEmail(
    notification: EmailNotification,
  ): Promise<NotificationResult> {
    try {
      // 1. 渲染邮件模板
      const content = await this.templateEngine.render(
        notification.templateId,
        notification.data,
      );

      // 2. 发送邮件
      const result = await this.emailService.send({
        to: notification.to,
        subject: notification.subject,
        content: content,
        attachments: notification.attachments,
      });

      // 3. 记录发送结果
      await this.recordNotificationResult(notification, result);

      this.logger.info('邮件发送成功', {
        to: notification.to,
        templateId: notification.templateId,
      });

      return result;
    } catch (error) {
      this.logger.error('邮件发送失败', { error, notification });

      // 4. 记录失败结果
      await this.recordNotificationResult(notification, {
        success: false,
        error: error.message,
      });

      throw new NotificationException('EMAIL_SEND_FAILED', '邮件发送失败');
    }
  }

  /**
   * @method sendSMS
   * @description 发送短信通知
   * @param notification 短信通知
   * @returns 发送结果
   */
  async sendSMS(notification: SMSNotification): Promise<NotificationResult> {
    try {
      // 1. 渲染短信模板
      const content = await this.templateEngine.render(
        notification.templateId,
        notification.data,
      );

      // 2. 发送短信
      const result = await this.smsService.send({
        to: notification.to,
        content: content,
      });

      // 3. 记录发送结果
      await this.recordNotificationResult(notification, result);

      this.logger.info('短信发送成功', {
        to: notification.to,
        templateId: notification.templateId,
      });

      return result;
    } catch (error) {
      this.logger.error('短信发送失败', { error, notification });

      await this.recordNotificationResult(notification, {
        success: false,
        error: error.message,
      });

      throw new NotificationException('SMS_SEND_FAILED', '短信发送失败');
    }
  }

  /**
   * @method sendPush
   * @description 发送推送通知
   * @param notification 推送通知
   * @returns 发送结果
   */
  async sendPush(notification: PushNotification): Promise<NotificationResult> {
    try {
      // 1. 渲染推送模板
      const content = await this.templateEngine.render(
        notification.templateId,
        notification.data,
      );

      // 2. 发送推送
      const result = await this.pushService.send({
        to: notification.to,
        title: notification.title,
        content: content,
        data: notification.data,
      });

      // 3. 记录发送结果
      await this.recordNotificationResult(notification, result);

      this.logger.info('推送发送成功', {
        to: notification.to,
        templateId: notification.templateId,
      });

      return result;
    } catch (error) {
      this.logger.error('推送发送失败', { error, notification });

      await this.recordNotificationResult(notification, {
        success: false,
        error: error.message,
      });

      throw new NotificationException('PUSH_SEND_FAILED', '推送发送失败');
    }
  }

  /**
   * @method sendMultiChannel
   * @description 多渠道发送通知
   * @param notification 多渠道通知
   * @returns 发送结果
   */
  async sendMultiChannel(
    notification: MultiChannelNotification,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // 并行发送到多个渠道
    const promises = notification.channels.map(async channel => {
      try {
        switch (channel.type) {
          case 'email':
            return await this.sendEmail(channel as EmailNotification);
          case 'sms':
            return await this.sendSMS(channel as SMSNotification);
          case 'push':
            return await this.sendPush(channel as PushNotification);
          default:
            throw new Error(`Unsupported channel type: ${channel.type}`);
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          channel: channel.type,
        };
      }
    });

    const channelResults = await Promise.allSettled(promises);

    channelResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Unknown error',
          channel: notification.channels[index]?.type,
        });
      }
    });

    return results;
  }

  /**
   * @method recordNotificationResult
   * @description 记录通知发送结果
   * @param notification 通知对象
   * @param result 发送结果
   * @returns 记录结果
   */
  private async recordNotificationResult(
    notification: BaseNotification,
    result: NotificationResult,
  ): Promise<void> {
    try {
      await this.notificationQueue.recordResult({
        notificationId: notification.id,
        channel: notification.channel,
        success: result.success,
        error: result.error,
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('记录通知结果失败', {
        error,
        notificationId: notification.id,
      });
    }
  }
}
```

---

## 📊 监控和告警设计

### 监控指标定义

#### 业务指标

```typescript
/**
 * @interface BusinessMetrics
 * @description 业务指标接口
 */
export interface BusinessMetrics {
  // 用户相关指标
  userRegistrationCount: number;
  userLoginCount: number;
  userActiveCount: number;

  // 租户相关指标
  tenantCreationCount: number;
  tenantActiveCount: number;

  // 权限相关指标
  permissionGrantCount: number;
  permissionRevokeCount: number;

  // 组织相关指标
  organizationCreationCount: number;
  departmentCreationCount: number;
}
```

#### 性能指标

```typescript
/**
 * @interface PerformanceMetrics
 * @description 性能指标接口
 */
export interface PerformanceMetrics {
  // API性能指标
  apiResponseTime: number;
  apiRequestCount: number;
  apiErrorRate: number;

  // 数据库性能指标
  databaseQueryTime: number;
  databaseConnectionCount: number;

  // 缓存性能指标
  cacheHitRate: number;
  cacheMissRate: number;

  // 系统资源指标
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}
```

### 监控服务实现

#### 监控服务

```typescript
/**
 * @class MonitoringService
 * @description 监控服务
 */
@Injectable()
export class MonitoringService {
  constructor(
    private readonly metricsCollector: MetricsCollector,
    private readonly alertService: AlertService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method recordBusinessMetric
   * @description 记录业务指标
   * @param metric 指标名称
   * @param value 指标值
   * @param tags 标签
   * @returns 记录结果
   */
  async recordBusinessMetric(
    metric: string,
    value: number,
    tags: Record<string, string> = {},
  ): Promise<void> {
    try {
      await this.metricsCollector.recordMetric({
        name: metric,
        value: value,
        type: 'counter',
        tags: {
          ...tags,
          service: 'iam',
          environment: process.env.NODE_ENV || 'development',
        },
        timestamp: new Date().toISOString(),
      });

      // 检查告警阈值
      await this.checkAlertThreshold(metric, value, tags);
    } catch (error) {
      this.logger.error('记录业务指标失败', { error, metric, value });
    }
  }

  /**
   * @method recordPerformanceMetric
   * @description 记录性能指标
   * @param metric 指标名称
   * @param value 指标值
   * @param tags 标签
   * @returns 记录结果
   */
  async recordPerformanceMetric(
    metric: string,
    value: number,
    tags: Record<string, string> = {},
  ): Promise<void> {
    try {
      await this.metricsCollector.recordMetric({
        name: metric,
        value: value,
        type: 'gauge',
        tags: {
          ...tags,
          service: 'iam',
          environment: process.env.NODE_ENV || 'development',
        },
        timestamp: new Date().toISOString(),
      });

      // 检查告警阈值
      await this.checkAlertThreshold(metric, value, tags);
    } catch (error) {
      this.logger.error('记录性能指标失败', { error, metric, value });
    }
  }

  /**
   * @method checkAlertThreshold
   * @description 检查告警阈值
   * @param metric 指标名称
   * @param value 指标值
   * @param tags 标签
   * @returns 检查结果
   */
  private async checkAlertThreshold(
    metric: string,
    value: number,
    tags: Record<string, string>,
  ): Promise<void> {
    try {
      const threshold = await this.getAlertThreshold(metric);
      if (!threshold) return;

      if (this.shouldAlert(threshold, value)) {
        await this.alertService.sendAlert({
          metric: metric,
          value: value,
          threshold: threshold,
          severity: threshold.severity,
          message: `指标 ${metric} 超过阈值: ${value} > ${threshold.value}`,
          tags: tags,
        });
      }
    } catch (error) {
      this.logger.error('检查告警阈值失败', { error, metric, value });
    }
  }

  /**
   * @method getAlertThreshold
   * @description 获取告警阈值
   * @param metric 指标名称
   * @returns 告警阈值
   */
  private async getAlertThreshold(
    metric: string,
  ): Promise<AlertThreshold | null> {
    // 从配置或数据库获取告警阈值
    const thresholds = {
      'api.response_time': { value: 1000, operator: '>', severity: 'warning' },
      'api.error_rate': { value: 0.05, operator: '>', severity: 'critical' },
      'cache.hit_rate': { value: 0.8, operator: '<', severity: 'warning' },
      'database.query_time': { value: 500, operator: '>', severity: 'warning' },
    };

    return thresholds[metric] || null;
  }

  /**
   * @method shouldAlert
   * @description 判断是否应该告警
   * @param threshold 告警阈值
   * @param value 当前值
   * @returns 是否告警
   */
  private shouldAlert(threshold: AlertThreshold, value: number): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.value;
      case '<':
        return value < threshold.value;
      case '>=':
        return value >= threshold.value;
      case '<=':
        return value <= threshold.value;
      case '==':
        return value === threshold.value;
      default:
        return false;
    }
  }
}
```

---

## 🎯 总结

### 技术设计方案要点

1. **架构模式**: 采用DDD + EDA + 微服务的混合架构
2. **技术栈**: NestJS + TypeScript + PostgreSQL + Redis
3. **缓存策略**: 多级缓存架构，提升系统性能
4. **事件驱动**: 完整的事件溯源和事件处理机制
5. **通知服务**: 多渠道通知能力，支持邮件、短信、推送
6. **监控告警**: 完整的监控指标和告警机制
7. **日志管理**: 结构化日志收集和分析
8. **安全设计**: JWT认证 + 权限控制 + 数据隔离

### 实施建议

1. **分阶段实施**: 按照四个阶段逐步实施
2. **测试驱动**: 编写完整的单元测试和集成测试
3. **性能优化**: 重点关注缓存和数据库优化
4. **安全加固**: 实施多层次安全防护
5. **监控运维**: 建立完整的监控和运维体系

### 后续工作

1. **详细设计**: 完善各个模块的详细设计
2. **代码实现**: 按照设计方案实现具体功能
3. **测试验证**: 进行全面的功能测试和性能测试
4. **部署上线**: 准备生产环境部署方案
5. **运维支持**: 建立运维监控和故障处理流程

---

_本文档的第三部分完成了IAM系统的缓存设计、通知服务、监控告警等高级功能的技术设计方案。整个方案涵盖了从基础架构到高级功能的各个方面，为系统的实施提供了全面的技术指导。_
