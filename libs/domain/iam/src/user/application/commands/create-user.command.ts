import { BaseCommand } from '@aiofix/domain-shared';
import { CreateUserDto } from '../dtos/create-user.dto';

/**
 * @class CreateUserCommand
 * @description 创建用户命令，定义创建用户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含创建用户所需的所有参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持用户和租户上下文信息
 *
 * 功能与业务规则：
 * 1. 定义创建用户的业务操作
 * 2. 包含用户的基本信息
 * 3. 包含用户的组织架构信息
 * 4. 支持角色分配和部门分配
 */
export class CreateUserCommand extends BaseCommand {
  /**
   * @property username
   * @description 用户名
   */
  readonly username: string;

  /**
   * @property email
   * @description 邮箱地址
   */
  readonly email: string;

  /**
   * @property firstName
   * @description 名
   */
  readonly firstName: string;

  /**
   * @property lastName
   * @description 姓
   */
  readonly lastName: string;

  /**
   * @property organizationId
   * @description 组织ID
   */
  readonly organizationId: string;

  /**
   * @property departmentId
   * @description 部门ID（可选）
   */
  readonly departmentId?: string;

  /**
   * @property roleIds
   * @description 角色ID列表（可选）
   */
  readonly roleIds?: string[];

  /**
   * @property phone
   * @description 手机号（可选）
   */
  readonly phone?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param dto 创建用户DTO
   * @param userId 执行命令的用户ID
   * @param tenantId 命令所属的租户ID
   */
  constructor(dto: CreateUserDto, userId?: string, tenantId?: string) {
    super(userId, tenantId);
    this.username = dto.username;
    this.email = dto.email;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.organizationId = dto.organizationId;
    this.departmentId = dto.departmentId;
    this.roleIds = dto.roleIds;
    this.phone = dto.phone;
  }
}
