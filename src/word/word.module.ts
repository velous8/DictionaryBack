import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { AdminWordController, WordController } from './word.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './entities/word.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Progression } from './entities/progression.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word, Progression]),
  AuthModule],
  controllers: [WordController, AdminWordController],
  providers: [WordService],
})
export class WordModule {}
