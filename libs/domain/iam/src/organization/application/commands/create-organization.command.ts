import { BaseCommand } from '@aiofix/domain-shared';
import { OrganizationType } from '../../domain/entities/organization.entity';

/**
 * @interface CreateOrganizationCommandData
 * @description 创建组织命令数据
 */
export interface CreateOrganizationCommandData {
  code: string;
  name: string;
  description?: string;
  type?: OrganizationType;
  tenantId: string;
  parentId?: string;
  managerId?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
    contactPhone?: string;
  };
  settings?: {
    allowUserRegistration?: boolean;
    requireApproval?: boolean;
    autoAssignRoles?: boolean;
    dataIsolationLevel?: string;
    notificationSettings?: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      pushNotifications?: boolean;
    };
    securitySettings?: {
      requireTwoFactor?: boolean;
      passwordPolicy?: string;
      sessionTimeout?: number;
    };
  };
  limits?: {
    maxUsers?: number;
    maxDepartments?: number;
    maxRoles?: number;
    maxProjects?: number;
    storageLimit?: number;
    apiRateLimit?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * @class CreateOrganizationCommand
 * @description 创建组织命令
 */
export class CreateOrganizationCommand extends BaseCommand {
  /**
   * @property data
   * @description 命令数据
   */
  readonly data: CreateOrganizationCommandData;

  constructor(data: CreateOrganizationCommandData) {
    super();
    this.data = data;
  }
}
