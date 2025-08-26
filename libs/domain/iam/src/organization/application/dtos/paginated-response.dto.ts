import { ApiProperty } from '@nestjs/swagger';

/**
 * @class PaginatedResponseDto
 * @description 分页响应DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  data!: T[];

  @ApiProperty({ description: '当前页码' })
  page!: number;

  @ApiProperty({ description: '每页数量' })
  limit!: number;

  @ApiProperty({ description: '总数量' })
  total!: number;

  @ApiProperty({ description: '总页数' })
  totalPages!: number;

  @ApiProperty({ description: '是否有下一页' })
  hasNext!: boolean;

  @ApiProperty({ description: '是否有上一页' })
  hasPrev!: boolean;

  /**
   * @static
   * @method fromData
   * @description 从数据创建分页响应
   * @param data 数据列表
   * @param page 当前页码
   * @param limit 每页数量
   * @param total 总数量
   * @returns {PaginatedResponseDto<T>} 分页响应
   */
  static fromData<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    const response = new PaginatedResponseDto<T>();
    response.data = data;
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = totalPages;
    response.hasNext = page < totalPages;
    response.hasPrev = page > 1;
    return response;
  }
}
