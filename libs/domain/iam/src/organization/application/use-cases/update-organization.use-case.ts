import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { UpdateOrganizationCommand } from '../commands/update-organization.command';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';

/**
 * @class UpdateOrganizationUseCase
 * @description 更新组织用例
 *
 * 主要原理与机制：
 * 1. 实现应用层的业务用例逻辑
 * 2. 使用命令总线发送更新组织命令
 * 3. 协调命令处理器执行具体业务逻辑
 * 4. 提供事务边界和错误处理
 *
 * 功能与业务规则：
 * 1. 接收更新组织请求
 * 2. 验证输入数据
 * 3. 发送更新命令
 * 4. 返回更新结果
 * 5. 处理业务异常
 */
@Injectable()
export class UpdateOrganizationUseCase {
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行更新组织用例
   * @param id 组织ID
   * @param updateOrganizationDto 更新组织DTO
   * @returns {Promise<void>}
   */
  async execute(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<void> {
    try {
      // 1. 创建命令
      const command = new UpdateOrganizationCommand({
        id,
        ...updateOrganizationDto,
      });

      // 2. 发送命令并等待结果
      await this.commandBus.execute(command);
    } catch (error) {
      console.error('更新组织用例执行失败:', (error as Error).message);
      throw error;
    }
  }
}
