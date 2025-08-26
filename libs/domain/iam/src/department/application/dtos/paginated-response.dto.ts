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
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * @class PaginatedResponseDto
 * @description 分页响应数据传输对象，定义分页查询结果的输出格式
 *
 * 主要原理与机制：
 * 1. 使用泛型支持不同类型的数据分页
 * 2. 使用@nestjs/swagger的ApiProperty装饰器生成API文档
 * 3. 提供标准化的分页信息格式
 * 4. 作为应用层与表现层之间的数据传输契约
 *
 * 功能与业务规则：
 * 1. 定义标准的分页响应格式
 * 2. 提供完整的分页元数据信息
 * 3. 支持不同类型数据的泛型分页
 * 4. 提供便捷的静态创建方法
 */
export class PaginatedResponseDto<T> {
  /**
   * @property data
   * @description 分页数据
   */
  @ApiProperty({
    description: '分页数据',
    isArray: true,
  })
  public readonly data!: T[];

  /**
   * @property pagination
   * @description 分页信息
   */
  @ApiProperty({
    description: '分页信息',
    type: 'object',
    properties: {
      page: { type: 'number', description: '当前页码' },
      limit: { type: 'number', description: '每页数量' },
      total: { type: 'number', description: '总记录数' },
      totalPages: { type: 'number', description: '总页数' },
      hasNext: { type: 'boolean', description: '是否有下一页' },
      hasPrev: { type: 'boolean', description: '是否有上一页' },
    },
  })
  public readonly pagination!: PaginationInfo;

  /**
   * @constructor
   * @description 构造函数
   * @param data 分页数据
   * @param pagination 分页信息
   */
  constructor(data: T[], pagination: PaginationInfo) {
    this.data = data;
    this.pagination = pagination;
  }

  /**
   * @method fromEntities
   * @description 从实体数组创建分页响应
   * @param entities 实体数组
   * @param page 页码
   * @param limit 每页数量
   * @param total 总记录数
   * @param mapper 实体到DTO的映射函数
   * @returns 分页响应DTO
   */
  static fromEntities<TEntity, TDto>(
    entities: TEntity[],
    page: number,
    limit: number,
    total: number,
    mapper: (entity: TEntity) => TDto,
  ): PaginatedResponseDto<TDto> {
    const data = entities.map(mapper);
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };

    return new PaginatedResponseDto(data, pagination);
  }

  /**
   * @method fromData
   * @description 从数据数组创建分页响应
   * @param data 数据数组
   * @param page 页码
   * @param limit 每页数量
   * @param total 总记录数
   * @returns 分页响应DTO
   */
  static fromData<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };

    return new PaginatedResponseDto(data, pagination);
  }

  /**
   * @method empty
   * @description 创建空的分页响应
   * @param page 页码
   * @param limit 每页数量
   * @returns 空的分页响应DTO
   */
  static empty<T>(
    page: number = 1,
    limit: number = 10,
  ): PaginatedResponseDto<T> {
    const pagination: PaginationInfo = {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };

    return new PaginatedResponseDto([], pagination);
  }
}
