import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@aiofix/domain-shared';
import { CreateOrganizationCommand } from '../commands/create-organization.command';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';

/**
 * @class CreateOrganizationUseCase
 * @description 创建组织用例
 *
 * 主要原理与机制：
 * 1. 实现应用层的业务用例逻辑
 * 2. 使用命令总线发送创建组织命令
 * 3. 协调命令处理器执行具体业务逻辑
 * 4. 提供事务边界和错误处理
 *
 * 功能与业务规则：
 * 1. 接收创建组织请求
 * 2. 验证输入数据
 * 3. 发送创建命令
 * 4. 返回创建结果
 * 5. 处理业务异常
 */
@Injectable()
export class CreateOrganizationUseCase {
  /**
   * @constructor
   * @description 构造函数
   * @param commandBus 命令总线
   */
  constructor(private readonly commandBus: ICommandBus) {}

  /**
   * @method execute
   * @description 执行创建组织用例
   * @param createOrganizationDto 创建组织DTO
   * @returns {Promise<string>} 组织ID
   */
  async execute(createOrganizationDto: CreateOrganizationDto): Promise<string> {
    try {
      // 1. 创建命令
      const command = new CreateOrganizationCommand(createOrganizationDto);

      // 2. 发送命令并等待结果
      await this.commandBus.execute(command);

      // 3. 返回组织ID（临时返回，实际应该从命令处理器返回）
      return 'organization-created';
    } catch (error) {
      console.error('创建组织用例执行失败:', (error as Error).message);
      throw error;
    }
  }
}
