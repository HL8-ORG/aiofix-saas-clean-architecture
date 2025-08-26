import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { GetUsersDto } from '../../application/dtos/get-users.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { PaginatedResponseDto } from '../../application/dtos/paginated-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import {
  UpdateUserUseCase,
  UpdateUserInput,
} from '../../application/use-cases/update-user.use-case';
import {
  DeleteUserUseCase,
  DeleteUserInput,
} from '../../application/use-cases/delete-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';

/**
 * @class UserController
 * @description 用户控制器，展现层的HTTP接口
 *
 * 主要原理与机制：
 * 1. 作为展现层的HTTP接口，直接使用Use-Case
 * 2. 遵循Clean Architecture，控制器只负责HTTP请求处理
 * 3. 不包含业务逻辑，业务逻辑由Use-Case处理
 * 4. 提供RESTful API接口
 *
 * 功能与业务规则：
 * 1. 处理HTTP请求和响应
 * 2. 参数验证和转换
 * 3. 调用相应的Use-Case
 * 4. 返回标准化的HTTP响应
 */
@ApiTags('用户管理')
@Controller('api/v1/users')
export class UserController {
  /**
   * @constructor
   * @description 构造函数
   * @param createUserUseCase 创建用户Use-Case
   * @param getUserUseCase 获取用户Use-Case
   * @param updateUserUseCase 更新用户Use-Case
   * @param deleteUserUseCase 删除用户Use-Case
   * @param getUsersUseCase 获取用户列表Use-Case
   */
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
  ) {}

  /**
   * @method createUser
   * @description 创建用户
   * @param createUserDto 创建用户DTO
   * @returns 用户响应DTO
   */
  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户账号' })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  /**
   * @method getUser
   * @description 获取用户信息
   * @param id 用户ID
   * @returns 用户响应DTO
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取用户信息',
    description: '根据用户ID获取用户详细信息',
  })
  @ApiParam({ name: 'id', description: '用户ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '获取用户成功',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }

  /**
   * @method updateUser
   * @description 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 更新用户DTO
   * @returns 用户响应DTO
   */
  @Put(':id')
  @ApiOperation({ summary: '更新用户信息', description: '更新用户的基本信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '用户更新成功',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const input: UpdateUserInput = {
      userId: id,
      updateData: updateUserDto,
    };
    return this.updateUserUseCase.execute(input);
  }

  /**
   * @method deleteUser
   * @description 删除用户
   * @param id 用户ID
   * @param hardDelete 是否硬删除
   * @param reason 删除原因
   * @param remark 删除备注
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '删除用户账号' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'string' })
  @ApiQuery({
    name: 'hardDelete',
    description: '是否硬删除',
    required: false,
    type: 'boolean',
  })
  @ApiQuery({
    name: 'reason',
    description: '删除原因',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'remark',
    description: '删除备注',
    required: false,
    type: 'string',
  })
  @ApiResponse({ status: 204, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async deleteUser(
    @Param('id') id: string,
    @Query('hardDelete') hardDelete?: boolean,
    @Query('reason') reason?: string,
    @Query('remark') remark?: string,
  ): Promise<void> {
    const input: DeleteUserInput = {
      userId: id,
      hardDelete,
      reason,
      remark,
    };
    return this.deleteUserUseCase.execute(input);
  }

  /**
   * @method getUsers
   * @description 获取用户列表
   * @param query 查询参数
   * @returns 用户列表响应
   */
  @Get()
  @ApiOperation({ summary: '获取用户列表', description: '分页查询用户列表' })
  @ApiResponse({
    status: 200,
    description: '获取用户列表成功',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  async getUsers(
    @Query() query: GetUsersDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.getUsersUseCase.execute(query);
  }
}
