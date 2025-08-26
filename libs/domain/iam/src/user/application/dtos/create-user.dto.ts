import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class CreateUserDto
 * @description 创建用户DTO，定义创建用户的输入参数
 *
 * 主要原理与机制：
 * 1. 定义了创建用户操作的输入参数结构
 * 2. 使用class-validator进行参数验证
 * 3. 使用Swagger装饰器生成API文档
 * 4. 支持可选参数，提供灵活的创建选项
 *
 * 功能与业务规则：
 * 1. 验证用户输入参数的有效性
 * 2. 确保必填字段不为空
 * 3. 验证邮箱格式的正确性
 * 4. 支持角色分配和部门分配
 */
export class CreateUserDto {
  /**
   * @property username
   * @description 用户名
   */
  @ApiProperty({ description: '用户名', example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  readonly username!: string;

  /**
   * @property email
   * @description 邮箱地址
   */
  @ApiProperty({ description: '邮箱地址', example: 'john.doe@example.com' })
  @IsEmail()
  readonly email!: string;

  /**
   * @property firstName
   * @description 名
   */
  @ApiProperty({ description: '名', example: 'John' })
  @IsString()
  @IsNotEmpty()
  readonly firstName!: string;

  /**
   * @property lastName
   * @description 姓
   */
  @ApiProperty({ description: '姓', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  readonly lastName!: string;

  /**
   * @property organizationId
   * @description 组织ID
   */
  @ApiProperty({
    description: '组织ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  readonly organizationId!: string;

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
