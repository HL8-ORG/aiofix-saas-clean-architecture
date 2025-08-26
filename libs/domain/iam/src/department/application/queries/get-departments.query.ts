import { BaseQuery } from '@aiofix/domain-shared';
import {
  DepartmentStatus,
  DepartmentType,
} from '../../domain/entities/department.entity';

export interface GetDepartmentsQueryData {
  page?: number;
  limit?: number;
  search?: string;
  status?: DepartmentStatus;
  type?: DepartmentType;
  organizationId?: string;
  parentId?: string;
  managerId?: string;
  includeStatistics?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GetDepartmentsQuery extends BaseQuery<any> {
  readonly data: GetDepartmentsQueryData;

  constructor(data: GetDepartmentsQueryData) {
    super();
    this.data = data;
  }
}
