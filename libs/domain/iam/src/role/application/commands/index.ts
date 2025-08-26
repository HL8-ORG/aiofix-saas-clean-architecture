/**
 * @file index.ts
 * @description 角色应用层命令导出文件
 *
 * 主要功能：
 * 1. 统一导出所有角色相关的命令类
 * 2. 提供便捷的导入接口
 * 3. 确保命令的一致性和可维护性
 */

export {
  CreateRoleCommand,
  CreateRoleCommandData,
} from './create-role.command';
export {
  UpdateRoleCommand,
  UpdateRoleCommandData,
} from './update-role.command';
export {
  DeleteRoleCommand,
  DeleteRoleCommandData,
} from './delete-role.command';
