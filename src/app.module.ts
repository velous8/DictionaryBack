import { Module } from '@nestjs/common';
import { WordModule } from './word/word.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './logger.config';

@Module({
  imports: [
        LoggerModule.forRoot( loggerConfig),
    WordModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PGHOST', 'localhost'),     // ← имя переменной, не значение
        port: configService.get('PGPORT', 5432),            // ← имя переменной
        username: configService.get('PGUSER', 'postgres'),  // ← имя переменной
        password: configService.get('PGPASSWORD', '1917'),  // ← имя переменной
        database: configService.get('PGDATABASE', 'dictionary'), // ← имя переменной
        autoLoadEntities: true,
        synchronize: true,  // отключите в production
        // extra: { ssl: true },  // для локальной разработки обычно false
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}