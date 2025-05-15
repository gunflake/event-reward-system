// libs/database/src/lib/database.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// MongoDB 연결 옵션을 위한 인터페이스 정의
export interface DatabaseOptions {
  dbName?: string;
  appName?: string;
  retryWrites?: boolean;
  [key: string]: any; // 기타 mongoose 옵션들을 위한 설정
}

@Module({})
export class DatabaseModule {
  static forRoot(uri: string, options: DatabaseOptions = {}): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRoot(uri, {
          dbName: options.dbName,
          appName: options.appName,
          retryWrites:
            options.retryWrites !== undefined ? options.retryWrites : true,
          ...options,
        }),
      ],
      global: true,
    };
  }
}
