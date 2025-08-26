import { ApiProperty } from '@nestjs/swagger';

/**
 * @interface PaginationMeta
 * @description 分页元数据接口
 */
export interface PaginationMeta {
  /**
   * @property total
   * @description 总记录数
   */
  total: number;

  /**
   * @property page
   * @description 当前页码
   */
  page: number;

  /**
   * @property limit
   * @description 每页数量
   */
  limit: number;

  /**
   * @property totalPages
   * @description 总页数
   */
  totalPages: number;

  /**
   * @property hasNext
   * @description 是否有下一页
   */
  hasNext: boolean;

  /**
   * @property hasPrev
   * @description 是否有上一页
   */
  hasPrev: boolean;
}

/**
 * @class PaginatedResponseDto
 * @description 分页响应DTO，定义分页查询的响应结构
 *
 * 主要原理与机制：
 * 1. 定义了分页查询的标准化响应结构
 * 2. 使用泛型支持不同类型的数据
 * 3. 使用Swagger装饰器生成API文档
 * 4. 包含分页元数据和数据列表
 *
 * 功能与业务规则：
 * 1. 提供标准化的分页响应格式
 * 2. 包含分页元数据（总数、页码、每页数量等）
 * 3. 支持任意类型的数据列表
 * 4. 便于前端分页组件使用
 */
export class PaginatedResponseDto<T> {
  /**
   * @property data
   * @description 数据列表
   */
  @ApiProperty({ description: '数据列表' })
  readonly data: T[];

  /**
   * @property meta
   * @description 分页元数据
   */
  @ApiProperty({ description: '分页元数据' })
  readonly meta: PaginationMeta;

  /**
   * @constructor
   * @description 构造函数
   * @param data 数据列表
   * @param total 总记录数
   * @param page 当前页码
   * @param limit 每页数量
   */
  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  /**
   * @method create
   * @description 创建分页响应
   * @param data 数据列表
   * @param total 总记录数
   * @param page 当前页码
   * @param limit 每页数量
   * @returns 分页响应DTO
   */
  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, total, page, limit);
  }
}
