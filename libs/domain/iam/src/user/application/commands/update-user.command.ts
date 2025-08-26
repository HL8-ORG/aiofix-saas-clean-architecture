import { BaseCommand } from '@aiofix/domain-shared';
import { UpdateUserDto } from '../dtos/update-user.dto';

/**
 * @class UpdateUserCommand
 * @description 更新用户命令，定义更新用户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含更新用户所需的所有参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持用户和租户上下文信息
 *
 * 功能与业务规则：
 * 1. 定义更新用户的业务操作
 * 2. 包含用户的基本信息更新
 * 3. 包含用户的组织架构信息更新
 * 4. 支持角色分配和部门分配更新
 */
export class UpdateUserCommand extends BaseCommand {
  /**
   * @property userId
   * @description 要更新的用户ID
   */
  readonly userId: string;

  /**
   * @property username
   * @description 用户名
   */
  readonly username?: string;

  /**
   * @property email
   * @description 邮箱地址
   */
  readonly email?: string;

  /**
   * @property firstName
   * @description 名
   */
  readonly firstName?: string;

  /**
   * @property lastName
   * @description 姓
   */
  readonly lastName?: string;

  /**
   * @property status
   * @description 用户状态
   */
  readonly status?: string;

  /**
   * @property organizationId
   * @description 组织ID
   */
  readonly organizationId?: string;

  /**
   * @property departmentId
   * @description 部门ID
   */
  readonly departmentId?: string;

  /**
   * @property roleIds
   * @description 角色ID列表
   */
  readonly roleIds?: string[];

  /**
   * @property phone
   * @description 手机号
   */
  readonly phone?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param userId 要更新的用户ID
   * @param dto 更新用户DTO
   * @param commandUserId 执行命令的用户ID
   * @param tenantId 命令所属的租户ID
   */
  constructor(
    userId: string,
    dto: UpdateUserDto,
    commandUserId?: string,
    tenantId?: string,
  ) {
    super(commandUserId, tenantId);
    this.userId = userId;
    this.username = dto.username;
    this.email = dto.email;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.status = dto.status;
    this.organizationId = dto.organizationId;
    this.departmentId = dto.departmentId;
    this.roleIds = dto.roleIds;
    this.phone = dto.phone;
  }
}
