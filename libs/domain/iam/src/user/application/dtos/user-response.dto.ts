import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';

/**
 * @enum UserStatus
 * @description 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * @class UserResponseDto
 * @description 用户响应DTO，定义用户信息的输出结构
 *
 * 主要原理与机制：
 * 1. 定义了用户信息的输出结构，用于API响应
 * 2. 使用Swagger装饰器生成API文档
 * 3. 包含用户的基本信息和关联信息
 * 4. 支持用户状态的枚举定义
 *
 * 功能与业务规则：
 * 1. 提供用户信息的标准化输出格式
 * 2. 包含用户的基本属性
 * 3. 包含用户的组织架构信息
 * 4. 包含用户的时间戳信息
 */
export class UserResponseDto {
  @ApiProperty({ description: '用户ID' })
  public readonly id!: string;

  @ApiProperty({ description: '用户名' })
  public readonly username!: string;

  @ApiProperty({ description: '邮箱地址' })
  public readonly email!: string;

  @ApiProperty({ description: '名' })
  public readonly firstName!: string;

  @ApiProperty({ description: '姓' })
  public readonly lastName!: string;

  @ApiProperty({ description: '全名' })
  public readonly fullName!: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus })
  public readonly status!: UserStatus;

  @ApiProperty({ description: '组织ID' })
  public readonly organizationId!: string;

  @ApiProperty({ description: '组织名称' })
  public readonly organizationName!: string;

  @ApiProperty({ description: '部门ID', required: false })
  public readonly departmentId?: string;

  @ApiProperty({ description: '部门名称', required: false })
  public readonly departmentName?: string;

  @ApiProperty({ description: '角色ID列表' })
  public readonly roleIds!: string[];

  @ApiProperty({ description: '角色名称列表' })
  public readonly roleNames!: string[];

  @ApiProperty({ description: '手机号', required: false })
  public readonly phone?: string;

  @ApiProperty({ description: '创建时间' })
  public readonly createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  public readonly updatedAt!: Date;

  /**
   * @method fromEntity
   * @description 从实体创建DTO
   * @param user 用户实体
   * @returns 用户响应DTO
   */
  static fromEntity(user: User): UserResponseDto {
    const profile = user.profile;
    return Object.assign(new UserResponseDto(), {
      id: user.id.value,
      username: user.username.value,
      email: user.email.value,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      fullName:
        `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
        'Unknown',
      status: user.status,
      organizationId: user.organizationId?.value || '',
      organizationName: '', // TODO: 需要从组织服务获取
      departmentId: user.departmentIds[0]?.value,
      departmentName: '', // TODO: 需要从部门服务获取
      roleIds: user.roleIds.map(roleId => roleId.value),
      roleNames: [], // TODO: 需要从角色服务获取
      phone: profile.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
