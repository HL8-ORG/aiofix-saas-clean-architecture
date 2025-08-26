/**
 * @file user-repository.interface.ts
 * @description 用户仓储接口
 *
 * 该文件定义了用户仓储接口，提供用户实体的数据访问方法。
 * 该接口继承自基础仓储接口，并添加了用户特有的查询方法。
 *
 * 主要功能：
 * 1. 提供用户实体的CRUD操作
 * 2. 提供用户特有的查询方法
 * 3. 支持用户状态管理
 * 4. 支持用户组织关系管理
 *
 * 业务规则：
 * 1. 用户名和邮箱在租户内必须唯一
 * 2. 用户查询必须支持多租户隔离
 * 3. 用户状态变更需要记录历史
 * 4. 用户删除前必须确保没有活跃会话
 */

import { Uuid } from '@aiofix/domain-shared';
import {
  BaseRepository,
  QueryOptions,
  QueryResult,
} from '@aiofix/domain-shared';
import { User, UserStatus, UserType } from '../entities/user.entity';

/**
 * @interface UserQueryOptions
 * @description 用户查询选项接口
 */
export interface UserQueryOptions extends QueryOptions {
  status?: UserStatus; // 用户状态
  type?: UserType; // 用户类型
  organizationId?: string; // 组织ID
  departmentId?: string; // 部门ID
  roleId?: string; // 角色ID
  isActive?: boolean; // 是否活跃
  isLocked?: boolean; // 是否锁定
  lastLoginAfter?: Date; // 最后登录时间（之后）
  lastLoginBefore?: Date; // 最后登录时间（之前）
  createdAfter?: Date; // 创建时间（之后）
  createdBefore?: Date; // 创建时间（之前）
  searchTerm?: string; // 搜索关键词
}

/**
 * @interface UserRepository
 * @description 用户仓储接口
 */
export interface UserRepository extends BaseRepository<User> {
  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 用户实例或null
   */
  findByUsername(username: string, tenantId: string): Promise<User | null>;

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   * @param email 邮箱
   * @param tenantId 租户ID
   * @returns 用户实例或null
   */
  findByEmail(email: string, tenantId: string): Promise<User | null>;

  /**
   * @method findByUsernameOrEmail
   * @description 根据用户名或邮箱查找用户
   * @param usernameOrEmail 用户名或邮箱
   * @param tenantId 租户ID
   * @returns 用户实例或null
   */
  findByUsernameOrEmail(
    usernameOrEmail: string,
    tenantId: string,
  ): Promise<User | null>;

  /**
   * @method findByOrganization
   * @description 根据组织查找用户
   * @param organizationId 组织ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByOrganization(
    organizationId: string,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findByDepartment
   * @description 根据部门查找用户
   * @param departmentId 部门ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByDepartment(
    departmentId: string,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findByRole
   * @description 根据角色查找用户
   * @param roleId 角色ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByRole(
    roleId: string,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findByStatus
   * @description 根据状态查找用户
   * @param status 用户状态
   * @param options 查询选项
   * @returns 查询结果
   */
  findByStatus(
    status: UserStatus,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findByType
   * @description 根据类型查找用户
   * @param type 用户类型
   * @param options 查询选项
   * @returns 查询结果
   */
  findByType(
    type: UserType,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findActiveUsers
   * @description 查找活跃用户
   * @param options 查询选项
   * @returns 查询结果
   */
  findActiveUsers(options?: UserQueryOptions): Promise<QueryResult<User>>;

  /**
   * @method findLockedUsers
   * @description 查找锁定用户
   * @param options 查询选项
   * @returns 查询结果
   */
  findLockedUsers(options?: UserQueryOptions): Promise<QueryResult<User>>;

  /**
   * @method findUsersByLastLogin
   * @description 根据最后登录时间查找用户
   * @param after 登录时间（之后）
   * @param before 登录时间（之前）
   * @param options 查询选项
   * @returns 查询结果
   */
  findUsersByLastLogin(
    after?: Date,
    before?: Date,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method findUsersByCreationDate
   * @description 根据创建时间查找用户
   * @param after 创建时间（之后）
   * @param before 创建时间（之前）
   * @param options 查询选项
   * @returns 查询结果
   */
  findUsersByCreationDate(
    after?: Date,
    before?: Date,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method searchUsers
   * @description 搜索用户
   * @param searchTerm 搜索关键词
   * @param options 查询选项
   * @returns 查询结果
   */
  searchUsers(
    searchTerm: string,
    options?: UserQueryOptions,
  ): Promise<QueryResult<User>>;

  /**
   * @method countByStatus
   * @description 统计各状态用户数量
   * @param tenantId 租户ID
   * @returns 各状态用户数量
   */
  countByStatus(tenantId: string): Promise<Record<UserStatus, number>>;

  /**
   * @method countByType
   * @description 统计各类型用户数量
   * @param tenantId 租户ID
   * @returns 各类型用户数量
   */
  countByType(tenantId: string): Promise<Record<UserType, number>>;

  /**
   * @method countByOrganization
   * @description 统计各组织用户数量
   * @param tenantId 租户ID
   * @returns 各组织用户数量
   */
  countByOrganization(tenantId: string): Promise<Record<string, number>>;

  /**
   * @method updateStatus
   * @description 更新用户状态
   * @param userId 用户ID
   * @param status 新状态
   * @param tenantId 租户ID
   * @param reason 变更原因
   * @returns 是否更新成功
   */
  updateStatus(
    userId: Uuid,
    status: UserStatus,
    tenantId: string,
    reason?: string,
  ): Promise<boolean>;

  /**
   * @method updatePassword
   * @description 更新用户密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @param tenantId 租户ID
   * @returns 是否更新成功
   */
  updatePassword(
    userId: Uuid,
    newPassword: string,
    tenantId: string,
  ): Promise<boolean>;

  /**
   * @method updateLastLogin
   * @description 更新用户最后登录时间
   * @param userId 用户ID
   * @param loginTime 登录时间
   * @param tenantId 租户ID
   * @returns 是否更新成功
   */
  updateLastLogin(
    userId: Uuid,
    loginTime: Date,
    tenantId: string,
  ): Promise<boolean>;

  /**
   * @method incrementLoginAttempts
   * @description 增加登录尝试次数
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否更新成功
   */
  incrementLoginAttempts(userId: Uuid, tenantId: string): Promise<boolean>;

  /**
   * @method resetLoginAttempts
   * @description 重置登录尝试次数
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否更新成功
   */
  resetLoginAttempts(userId: Uuid, tenantId: string): Promise<boolean>;

  /**
   * @method lockUser
   * @description 锁定用户
   * @param userId 用户ID
   * @param lockUntil 锁定截止时间
   * @param tenantId 租户ID
   * @param reason 锁定原因
   * @returns 是否锁定成功
   */
  lockUser(
    userId: Uuid,
    lockUntil: Date,
    tenantId: string,
    reason?: string,
  ): Promise<boolean>;

  /**
   * @method unlockUser
   * @description 解锁用户
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否解锁成功
   */
  unlockUser(userId: Uuid, tenantId: string): Promise<boolean>;

  /**
   * @method addToDepartment
   * @description 将用户添加到部门
   * @param userId 用户ID
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @returns 是否添加成功
   */
  addToDepartment(
    userId: Uuid,
    departmentId: Uuid,
    tenantId: string,
  ): Promise<boolean>;

  /**
   * @method removeFromDepartment
   * @description 将用户从部门移除
   * @param userId 用户ID
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @returns 是否移除成功
   */
  removeFromDepartment(
    userId: Uuid,
    departmentId: Uuid,
    tenantId: string,
  ): Promise<boolean>;

  /**
   * @method addRole
   * @description 为用户添加角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns 是否添加成功
   */
  addRole(userId: Uuid, roleId: Uuid, tenantId: string): Promise<boolean>;

  /**
   * @method removeRole
   * @description 移除用户角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns 是否移除成功
   */
  removeRole(userId: Uuid, roleId: Uuid, tenantId: string): Promise<boolean>;

  /**
   * @method checkUsernameExists
   * @description 检查用户名是否存在
   * @param username 用户名
   * @param tenantId 租户ID
   * @param excludeUserId 排除的用户ID（用于更新时检查）
   * @returns 是否存在
   */
  checkUsernameExists(
    username: string,
    tenantId: string,
    excludeUserId?: Uuid,
  ): Promise<boolean>;

  /**
   * @method checkEmailExists
   * @description 检查邮箱是否存在
   * @param email 邮箱
   * @param tenantId 租户ID
   * @param excludeUserId 排除的用户ID（用于更新时检查）
   * @returns 是否存在
   */
  checkEmailExists(
    email: string,
    tenantId: string,
    excludeUserId?: Uuid,
  ): Promise<boolean>;
}
