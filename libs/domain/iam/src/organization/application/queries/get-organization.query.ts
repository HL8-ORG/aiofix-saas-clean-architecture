import { BaseQuery } from '@aiofix/domain-shared';

/**
 * @interface GetOrganizationQueryData
 * @description 获取组织查询数据
 */
export interface GetOrganizationQueryData {
  id: string;
  includeStatistics?: boolean;
  includeChildren?: boolean;
  includeMembers?: boolean;
}

/**
 * @class GetOrganizationQuery
 * @description 获取组织查询
 */
export class GetOrganizationQuery extends BaseQuery<any> {
  /**
   * @property data
   * @description 查询数据
   */
  readonly data: GetOrganizationQueryData;

  constructor(data: GetOrganizationQueryData) {
    super();
    this.data = data;
  }
}
