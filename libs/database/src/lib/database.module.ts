// libs/database/src/lib/database.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

@Module({})
export class DatabaseModule {
  static forRoot(uri: string, options: MongooseModuleOptions): DynamicModule {
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
