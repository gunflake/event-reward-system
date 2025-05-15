import { DatabaseModule } from '@maplestory/database';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DatabaseModule.forRoot(process.env.MONGODB_URI, {
      dbName: 'auth-db',
      appName: 'auth-app',
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
