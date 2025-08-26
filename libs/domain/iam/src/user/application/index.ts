/**
 * @file index.ts
 * @description 用户应用层入口文件
 *
 * 该文件是用户应用层的主要入口点，提供：
 * - 用户Use-Case
 * - 用户命令和查询
 * - 用户DTO
 * - 用户模块
 *
 * 遵循Clean Architecture原则，提供统一的用户业务操作抽象。
 */

// 导出DTO
export * from './dtos/create-user.dto';
export * from './dtos/user-response.dto';
export * from './dtos/update-user.dto';
export * from './dtos/get-users.dto';
export * from './dtos/paginated-response.dto';

// 导出命令
export * from './commands/create-user.command';
export * from './commands/update-user.command';
export * from './commands/delete-user.command';

// 导出查询
export * from './queries/get-user.query';
export * from './queries/get-users.query';

// 导出Use-Case
export * from './use-cases/create-user.use-case';
export * from './use-cases/get-user.use-case';
export * from './use-cases/update-user.use-case';
export * from './use-cases/delete-user.use-case';
export * from './use-cases/get-users.use-case';

// 导出模块
export * from './user.module';
