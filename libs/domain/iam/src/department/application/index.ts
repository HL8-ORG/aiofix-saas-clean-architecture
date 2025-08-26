/**
 * @file index.ts
 * @description 部门应用层索引文件
 *
 * 该文件导出部门应用层的所有公共接口和组件，方便其他模块使用。
 * 作为部门应用层的统一入口点，提供清晰的模块边界。
 *
 * 主要功能：
 * 1. 导出部门应用层模块
 * 2. 导出部门用例接口
 * 3. 导出部门DTO接口
 * 4. 提供模块间的清晰边界
 * 5. 简化模块间的依赖关系
 *
 * 业务规则：
 * 1. 只导出必要的公共接口
 * 2. 保持模块边界的清晰性
 * 3. 遵循最小权限原则
 * 4. 提供稳定的API接口
 */

// 导出部门应用层模块
export { DepartmentModule } from './department.module';

// 导出部门用例
export {
  CreateDepartmentUseCase,
  UpdateDepartmentUseCase,
  DeleteDepartmentUseCase,
  GetDepartmentUseCase,
  GetDepartmentsUseCase,
} from './use-cases';

// 导出部门DTO
export {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  PaginatedResponseDto,
} from './dtos';

// 导出部门命令
export {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  DeleteDepartmentCommand,
} from './commands';

// 导出部门查询
export { GetDepartmentQuery, GetDepartmentsQuery } from './queries';
