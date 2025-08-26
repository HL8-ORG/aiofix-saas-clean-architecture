import { BaseQuery } from '@aiofix/domain-shared';
import {
  OrganizationStatus,
  OrganizationType,
} from '../../domain/entities/organization.entity';

/**
 * @interface GetOrganizationsQueryData
 * @description 获取组织列表查询数据
 */
export interface GetOrganizationsQueryData {
  page?: number;
  limit?: number;
  search?: string;
  tenantId?: string;
  parentId?: string;
  status?: OrganizationStatus;
  type?: OrganizationType;
  managerId?: string;
  includeStatistics?: boolean;
  includeChildren?: boolean;
  includeMembers?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * @class GetOrganizationsQuery
 * @description 获取组织列表查询
 */
export class GetOrganizationsQuery extends BaseQuery<any> {
  /**
   * @property data
   * @description 查询数据
   */
  readonly data: GetOrganizationsQueryData;

  constructor(data: GetOrganizationsQueryData) {
    super();
    this.data = data;
  }
}
