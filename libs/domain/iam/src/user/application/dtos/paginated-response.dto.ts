import { ApiProperty } from '@nestjs/swagger';

/**
 * @interface PaginationInfo
 * @description 分页信息接口
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * @class PaginatedResponseDto
 * @description 分页响应DTO，用于包装分页查询结果
 *
 * 主要原理与机制：
 * 1. 提供标准的分页响应格式
 * 2. 包含数据列表和分页信息
 * 3. 支持泛型类型，适用于各种数据类型
 * 4. 使用Swagger装饰器生成API文档
 *
 * 功能与业务规则：
 * 1. 统一分页响应格式
 * 2. 提供完整的分页信息
 * 3. 支持前端分页组件
 * 4. 便于API文档生成
 */
export class PaginatedResponseDto<T> {
  /**
   * @property data
   * @description 数据列表
   */
  @ApiProperty({ description: '数据列表' })
  readonly data!: T[];

  /**
   * @property pagination
   * @description 分页信息
   */
  @ApiProperty({ description: '分页信息' })
  readonly pagination!: PaginationInfo;

  /**
   * @constructor
   * @description 构造函数
   * @param data 数据列表
   * @param pagination 分页信息
   */
  constructor(data: T[], pagination: PaginationInfo) {
    this.data = data;
    this.pagination = pagination;
  }
}
