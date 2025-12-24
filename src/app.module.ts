import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordModule } from './word/word.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/dictionary'), WordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
