/**
 * @file user-domain.service.ts
 * @description 用户领域服务
 *
 * 该文件定义了用户领域服务，包含用户相关的复杂业务逻辑。
 * 该服务封装了不适合放在实体中的业务规则和操作。
 *
 * 主要功能：
 * 1. 用户创建和验证逻辑
 * 2. 用户状态管理逻辑
 * 3. 用户权限和角色管理
 * 4. 用户组织关系管理
 * 5. 用户安全相关操作
 *
 * 业务规则：
 * 1. 用户创建时必须验证唯一性
 * 2. 用户状态变更必须符合业务规则
 * 3. 用户权限分配必须验证有效性
 * 4. 用户删除前必须检查依赖关系
 */

import { Uuid } from '@aiofix/domain-shared';
import {
  User,
  UserStatus,
  UserType,
  UserProfile,
  UserSettings,
} from '../entities/user.entity';
import { Username } from '../value-objects/username.vo';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import {
  UserRepository,
  UserQueryOptions,
} from '../repositories/user-repository.interface';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserStatusChangedEvent,
} from '../events';
import { QueryResult } from '@aiofix/domain-shared';

/**
 * @interface CreateUserRequest
 * @description 创建用户请求接口
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  tenantId: string;
  organizationId?: string;
  type?: UserType;
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
  createdBy?: string;
}

/**
 * @interface UpdateUserRequest
 * @description 更新用户请求接口
 */
export interface UpdateUserRequest {
  userId: string;
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
  organizationId?: string;
  updatedBy?: string;
  reason?: string;
}

/**
 * @interface ChangeUserStatusRequest
 * @description 变更用户状态请求接口
 */
export interface ChangeUserStatusRequest {
  userId: string;
  newStatus: UserStatus;
  tenantId: string;
  changedBy?: string;
  reason?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

/**
 * @interface UserValidationResult
 * @description 用户验证结果接口
 */
export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * @class UserDomainService
 * @description 用户领域服务
 */
export class UserDomainService {
  /**
   * @constructor
   * @param userRepository 用户仓储
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method createUser
   * @description 创建用户
   * @param request 创建用户请求
   * @returns 创建的用户实例
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    // 验证请求数据
    const validation = await this.validateCreateUserRequest(request);
    if (!validation.isValid) {
      throw new Error(`用户创建验证失败: ${validation.errors.join(', ')}`);
    }

    // 创建值对象
    const id = Uuid.generate();
    const username = new Username(request.username);
    const email = new Email(request.email);
    const password = new Password(request.password);
    const tenantId = new Uuid(request.tenantId);
    const organizationId = request.organizationId
      ? new Uuid(request.organizationId)
      : undefined;

    // 创建用户实体
    const user = new User(
      id,
      username,
      email,
      password,
      tenantId,
      organizationId,
      request.type || UserType.INTERNAL,
    );

    // 设置用户档案
    if (request.profile) {
      user.updateProfile(request.profile);
    }

    // 设置用户设置
    if (request.settings) {
      user.updateSettings(request.settings);
    }

    // 保存用户
    const savedUser = await this.userRepository.save(user);

    // 发布用户创建事件
    const _userCreatedEvent = new UserCreatedEvent(
      savedUser,
      request.createdBy,
    );

    // 这里应该发布事件到事件总线
    // await this.eventBus.publish(_userCreatedEvent);

    return savedUser;
  }

  /**
   * @method updateUser
   * @description 更新用户
   * @param request 更新用户请求
   * @returns 更新后的用户实例
   */
  async updateUser(request: UpdateUserRequest): Promise<User | null> {
    const userId = new Uuid(request.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('用户不存在');
    }

    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    const updatedFields: string[] = [];

    // 更新用户档案
    if (request.profile) {
      oldValues.profile = { ...user.profile };
      user.updateProfile(request.profile);
      newValues.profile = { ...user.profile };
      updatedFields.push('profile');
    }

    // 更新用户设置
    if (request.settings) {
      oldValues.settings = { ...user.settings };
      user.updateSettings(request.settings);
      newValues.settings = { ...user.settings };
      updatedFields.push('settings');
    }

    // 更新组织ID
    if (request.organizationId) {
      oldValues.organizationId = user.organizationId?.value;
      user.setOrganization(new Uuid(request.organizationId));
      newValues.organizationId = user.organizationId?.value;
      updatedFields.push('organizationId');
    }

    // 保存用户
    const updatedUser = await this.userRepository.save(user);

    // 发布用户更新事件
    if (updatedFields.length > 0) {
      const _userUpdatedEvent = new UserUpdatedEvent(
        updatedUser,
        updatedFields,
        oldValues,
        newValues,
        request.updatedBy,
        request.reason,
      );

      // 这里应该发布事件到事件总线
      // await this.eventBus.publish(_userUpdatedEvent);
    }

    return updatedUser;
  }

  /**
   * @method changeUserStatus
   * @description 变更用户状态
   * @param request 变更用户状态请求
   * @returns 是否变更成功
   */
  async changeUserStatus(request: ChangeUserStatusRequest): Promise<boolean> {
    const userId = new Uuid(request.userId);
    const user = await this.userRepository.findById(userId, request.tenantId);

    if (!user) {
      throw new Error('用户不存在');
    }

    const oldStatus = user.status;
    const newStatus = request.newStatus;

    // 验证状态变更是否有效
    const validation = this.validateStatusChange(oldStatus, newStatus);
    if (!validation.isValid) {
      throw new Error(`状态变更验证失败: ${validation.errors.join(', ')}`);
    }

    // 执行状态变更
    const success = await this.userRepository.updateStatus(
      userId,
      newStatus,
      request.tenantId,
      request.reason,
    );

    if (success) {
      // 发布用户状态变更事件
      const _userStatusChangedEvent = new UserStatusChangedEvent(
        user,
        oldStatus,
        newStatus,
        request.changedBy,
        request.reason,
        request.effectiveDate,
        request.expiryDate,
      );

      // 这里应该发布事件到事件总线
      // await this.eventBus.publish(_userStatusChangedEvent);
    }

    return success;
  }

  /**
   * @method validateCreateUserRequest
   * @description 验证创建用户请求
   * @param request 创建用户请求
   * @returns 验证结果
   */
  async validateCreateUserRequest(
    request: CreateUserRequest,
  ): Promise<UserValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证必填字段
    if (!request.username) {
      errors.push('用户名不能为空');
    }
    if (!request.email) {
      errors.push('邮箱不能为空');
    }
    if (!request.password) {
      errors.push('密码不能为空');
    }
    if (!request.tenantId) {
      errors.push('租户ID不能为空');
    }

    // 验证用户名唯一性
    if (request.username) {
      const existingUser = await this.userRepository.findByUsername(
        request.username,
        request.tenantId,
      );
      if (existingUser) {
        errors.push('用户名已存在');
      }
    }

    // 验证邮箱唯一性
    if (request.email) {
      const existingUser = await this.userRepository.findByEmail(
        request.email,
        request.tenantId,
      );
      if (existingUser) {
        errors.push('邮箱已存在');
      }
    }

    // 验证密码强度
    if (request.password) {
      try {
        new Password(request.password);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`密码不符合要求: ${errorMessage}`);
      }
    }

    // 验证用户名格式
    if (request.username) {
      try {
        new Username(request.username);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`用户名格式不正确: ${errorMessage}`);
      }
    }

    // 验证邮箱格式
    if (request.email) {
      try {
        new Email(request.email);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        errors.push(`邮箱格式不正确: ${errorMessage}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @method validateStatusChange
   * @description 验证状态变更
   * @param oldStatus 旧状态
   * @param newStatus 新状态
   * @returns 验证结果
   */
  validateStatusChange(
    oldStatus: UserStatus,
    newStatus: UserStatus,
  ): UserValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查状态变更是否有效
    const validTransitions: Record<UserStatus, UserStatus[]> = {
      [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.DISABLED],
      [UserStatus.ACTIVE]: [
        UserStatus.SUSPENDED,
        UserStatus.LOCKED,
        UserStatus.DISABLED,
      ],
      [UserStatus.SUSPENDED]: [
        UserStatus.ACTIVE,
        UserStatus.LOCKED,
        UserStatus.DISABLED,
      ],
      [UserStatus.LOCKED]: [UserStatus.ACTIVE, UserStatus.DISABLED],
      [UserStatus.DISABLED]: [UserStatus.ACTIVE],
    };

    const allowedTransitions = validTransitions[oldStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      errors.push(`不允许从状态 ${oldStatus} 变更为 ${newStatus}`);
    }

    // 检查是否为降级操作
    if (oldStatus === UserStatus.ACTIVE && newStatus !== UserStatus.ACTIVE) {
      warnings.push('将活跃用户降级可能会影响其访问权限');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @method getUserStatistics
   * @description 获取用户统计信息
   * @param tenantId 租户ID
   * @returns 用户统计信息
   */
  async getUserStatistics(tenantId: string): Promise<{
    total: number;
    byStatus: Record<UserStatus, number>;
    byType: Record<UserType, number>;
    active: number;
    inactive: number;
  }> {
    const [total, byStatus, byType] = await Promise.all([
      this.userRepository.count([], tenantId),
      this.userRepository.countByStatus(tenantId),
      this.userRepository.countByType(tenantId),
    ]);

    const active = byStatus[UserStatus.ACTIVE] || 0;
    const inactive = total - active;

    return {
      total,
      byStatus,
      byType,
      active,
      inactive,
    };
  }

  /**
   * @method searchUsers
   * @description 搜索用户
   * @param searchTerm 搜索关键词
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 搜索结果
   */
  async searchUsers(
    searchTerm: string,
    tenantId: string,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>> {
    return this.userRepository.searchUsers(searchTerm, {
      ...options,
      tenantId,
    });
  }

  /**
   * @method getUserByUsernameOrEmail
   * @description 根据用户名或邮箱获取用户
   * @param usernameOrEmail 用户名或邮箱
   * @param tenantId 租户ID
   * @returns 用户实例或null
   */
  async getUserByUsernameOrEmail(
    usernameOrEmail: string,
    tenantId: string,
  ): Promise<User | null> {
    return this.userRepository.findByUsernameOrEmail(usernameOrEmail, tenantId);
  }

  /**
   * @method isUserActive
   * @description 检查用户是否活跃
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否活跃
   */
  async isUserActive(userId: string, tenantId: string): Promise<boolean> {
    const user = await this.userRepository.findById(new Uuid(userId), tenantId);
    return user ? user.status === UserStatus.ACTIVE : false;
  }

  /**
   * @method canUserLogin
   * @description 检查用户是否可以登录
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否可以登录
   */
  async canUserLogin(userId: string, tenantId: string): Promise<boolean> {
    const user = await this.userRepository.findById(new Uuid(userId), tenantId);
    if (!user) {
      return false;
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      return false;
    }

    // 检查用户是否被锁定
    if (user.isLocked) {
      return false;
    }

    return true;
  }
}
