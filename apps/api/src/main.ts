import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

/**
 * @function bootstrap
 * @description
 * 启动NestJS应用的主函数。该函数负责创建基于Fastify平台的应用实例，
 * 并监听指定端口启动高性能HTTP服务。
 *
 * 主要原理与机制如下：
 * 1. 通过NestFactory.create创建应用实例，使用FastifyAdapter作为HTTP适配器，
 *    Fastify是一个高性能的Node.js web框架，相比Express具有更好的性能表现。
 * 2. FastifyAdapter提供了Fastify与NestJS的集成，使得NestJS可以充分利用
 *    Fastify的高性能特性，如更快的路由匹配、更低的延迟等。
 * 3. 最后通过listen方法监听环境变量PORT指定的端口（默认3000），启动HTTP服务。
 *
 * 功能与业务规则：
 * 1. 启动应用服务器
 * 2. 配置全局中间件和管道
 * 3. 启用CORS支持
 * 4. 设置全局前缀
 * 5. 配置Swagger文档
 * @returns {Promise<void>} 返回一个Promise，表示应用启动过程
 */
async function bootstrap() {
  // 创建基于Fastify的Nest应用实例
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 配置全局前缀
  app.setGlobalPrefix('api/v1');

  // 启用CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // 启动HTTP服务，监听指定端口
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
}

// 启动应用
bootstrap();
