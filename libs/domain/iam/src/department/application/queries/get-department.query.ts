import { BaseQuery } from '@aiofix/domain-shared';

export interface GetDepartmentQueryData {
  id: string;
  includeChildren?: boolean;
  includeMembers?: boolean;
  includeStatistics?: boolean;
}

export class GetDepartmentQuery extends BaseQuery<any> {
  readonly data: GetDepartmentQueryData;

  constructor(data: GetDepartmentQueryData) {
    super();
    this.data = data;
  }
}
