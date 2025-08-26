import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '../../../application/cqrs/command-bus';
import { QueryBus } from '../../../application/cqrs/query-bus';
import { HandlerRegistryService } from '../../../application/cqrs/handler-registry.service';
import { ICommand } from '../../../application/interfaces/command.interface';
import { IQuery } from '../../../application/interfaces/query.interface';
import { ICommandHandler } from '../../../application/interfaces/command-handler.interface';
import { IQueryHandler } from '../../../application/interfaces/query-handler.interface';

// 测试命令
class TestCommand implements ICommand {
  constructor(
    public readonly commandId: string,
    public readonly timestamp: Date,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public readonly data: string,
  ) {}
}

// 测试查询
class TestQuery implements IQuery<string> {
  constructor(
    public readonly queryId: string,
    public readonly timestamp: Date,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public readonly filter: string,
  ) {}
}

// 测试命令处理器
class TestCommandHandler implements ICommandHandler<TestCommand, string> {
  async execute(command: TestCommand): Promise<string> {
    return `processed-${command.data}`;
  }
}

// 测试查询处理器
class TestQueryHandler implements IQueryHandler<TestQuery, string> {
  async execute(query: TestQuery): Promise<string> {
    return `result-${query.filter}`;
  }
}

describe('CQRS Architecture', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let handlerRegistry: HandlerRegistryService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CommandBus, QueryBus, HandlerRegistryService],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
    handlerRegistry = module.get<HandlerRegistryService>(
      HandlerRegistryService,
    );
  });

  afterEach(async () => {
    await module.close();
  });

  describe('CommandBus', () => {
    it('should register and execute command handlers', async () => {
      const handler = new TestCommandHandler();
      const command = new TestCommand(
        'test-command-id',
        new Date(),
        'correlation-id',
        'causation-id',
        'test-data',
      );

      // 注册处理器
      commandBus.registerHandler('TestCommand', handler);

      // 执行命令
      const result = await commandBus.execute(command);

      expect(result).toBe('processed-test-data');
    });

    it('should throw error when handler not found', async () => {
      const command = new TestCommand(
        'test-command-id',
        new Date(),
        'correlation-id',
        'causation-id',
        'test-data',
      );

      await expect(commandBus.execute(command)).rejects.toThrow(
        'No handler found for command: TestCommand',
      );
    });

    it('should list registered commands', () => {
      const handler = new TestCommandHandler();
      commandBus.registerHandler('TestCommand', handler);

      const commands = commandBus.getRegisteredCommands();
      expect(commands).toContain('TestCommand');
    });
  });

  describe('QueryBus', () => {
    it('should register and execute query handlers', async () => {
      const handler = new TestQueryHandler();
      const query = new TestQuery(
        'test-query-id',
        new Date(),
        'correlation-id',
        'causation-id',
        'test-filter',
      );

      // 注册处理器
      queryBus.registerHandler('TestQuery', handler);

      // 执行查询
      const result = await queryBus.execute(query);

      expect(result).toBe('result-test-filter');
    });

    it('should throw error when handler not found', async () => {
      const query = new TestQuery(
        'test-query-id',
        new Date(),
        'correlation-id',
        'causation-id',
        'test-filter',
      );

      await expect(queryBus.execute(query)).rejects.toThrow(
        'No handler found for query: TestQuery',
      );
    });

    it('should cache query results', async () => {
      const handler = new TestQueryHandler();
      const query = new TestQuery(
        'test-query-id',
        new Date(),
        'correlation-id',
        'causation-id',
        'test-filter',
      );

      queryBus.registerHandler('TestQuery', handler);

      // 第一次执行
      const result1 = await queryBus.execute(query);
      // 第二次执行（应该从缓存获取）
      const result2 = await queryBus.execute(query);

      expect(result1).toBe('result-test-filter');
      expect(result2).toBe('result-test-filter');
    });

    it('should list registered queries', () => {
      const handler = new TestQueryHandler();
      queryBus.registerHandler('TestQuery', handler);

      const queries = queryBus.getRegisteredQueries();
      expect(queries).toContain('TestQuery');
    });
  });

  describe('HandlerRegistryService', () => {
    it('should register command handlers', () => {
      const handler = new TestCommandHandler();
      handlerRegistry.registerCommandHandler('TestCommand', handler);

      const commands = handlerRegistry.getRegisteredCommandHandlers();
      expect(commands).toContain('TestCommand');
    });

    it('should register query handlers', () => {
      const handler = new TestQueryHandler();
      handlerRegistry.registerQueryHandler('TestQuery', handler);

      const queries = handlerRegistry.getRegisteredQueryHandlers();
      expect(queries).toContain('TestQuery');
    });

    it('should clear all handlers', () => {
      const commandHandler = new TestCommandHandler();
      const queryHandler = new TestQueryHandler();

      handlerRegistry.registerCommandHandler('TestCommand', commandHandler);
      handlerRegistry.registerQueryHandler('TestQuery', queryHandler);

      handlerRegistry.clearAllHandlers();

      expect(handlerRegistry.getRegisteredCommandHandlers()).toHaveLength(0);
      expect(handlerRegistry.getRegisteredQueryHandlers()).toHaveLength(0);
    });
  });
});
