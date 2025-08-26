import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsArray,
} from 'class-validator';
import { UserStatus } from '../../domain/entities/user.entity';

/**
 * @class UpdateUserDto
 * @description 更新用户DTO，定义更新用户操作的输入参数
 *
 * 主要原理与机制：
 * 1. 定义了更新用户操作的输入参数结构
 * 2. 使用class-validator进行参数验证
 * 3. 使用Swagger装饰器生成API文档
 * 4. 所有字段都是可选的，支持部分更新
 *
 * 功能与业务规则：
 * 1. 验证用户输入参数的有效性
 * 2. 支持部分字段更新
 * 3. 验证邮箱格式的正确性
 * 4. 支持角色分配和部门分配
 */
export class UpdateUserDto {
  /**
   * @property username
   * @description 用户名
   */
  @ApiProperty({ description: '用户名', example: 'john.doe', required: false })
  @IsString()
  @IsOptional()
  readonly username?: string;

  /**
   * @property email
   * @description 邮箱地址
   */
  @ApiProperty({
    description: '邮箱地址',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  /**
   * @property firstName
   * @description 名
   */
  @ApiProperty({ description: '名', example: 'John', required: false })
  @IsString()
  @IsOptional()
  readonly firstName?: string;

  /**
   * @property lastName
   * @description 姓
   */
  @ApiProperty({ description: '姓', example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  readonly lastName?: string;

  /**
   * @property status
   * @description 用户状态
   */
  @ApiProperty({ description: '用户状态', enum: UserStatus, required: false })
  @IsOptional()
  readonly status?: UserStatus;

  /**
   * @property organizationId
   * @description 组织ID
   */
  @ApiProperty({
    description: '组织ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly organizationId?: string;

  /**
   * @property departmentId
   * @description 部门ID（可选）
   */
  @ApiProperty({
    description: '部门ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly departmentId?: string;

  /**
   * @property roleIds
   * @description 角色ID列表（可选）
   */
  @ApiProperty({
    description: '角色ID列表',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
    required: false,
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  readonly roleIds?: string[];

  /**
   * @property phone
   * @description 手机号（可选）
   */
  @ApiProperty({
    description: '手机号',
    example: '+86-138-0013-8000',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly phone?: string;
}
