import { Model, Types } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, DataSource, Repository} from 'typeorm';
import {Word} from './entities/word.entity';
import {Progression} from './entities/progression.entity';
import { UpdateProgressDto } from './dto/progression.dto';
import { CreateWordDto } from './dto/createWord.dto';
import { UpdateWordDto } from './dto/updateWord.dto';

@Injectable()
export class WordService {
   constructor(
    @InjectRepository(Word)
    private wordsRepository: Repository<Word>,
    @InjectRepository(Progression)
    private progressionRepository: Repository<Progression>,
    private readonly dataSource: DataSource) {}
    
    async findAll(): Promise<Word[]> {
        return this.wordsRepository.find();
    }


    
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////        
 /*
   * Возвращает массив ID слов, которые для данного пользователя:
   * - либо отсутствуют в таблице progressions,
   * - либо имеют progress = 0.
   */
async getWordsByIds(ids: number[]): Promise<Word[]> {
  if (!ids || ids.length === 0) return [];
  return this.wordsRepository.find({ where: { id: In(ids) } });
}

async getWordsAmount(userId: number): Promise<number> {
  return await this.wordsRepository.count()
}

  async getIdsUnknownWord(userId: number): Promise<number[]> {
    // Подзапрос: выбираем все wordId, для которых есть запись прогресса > 0
    const subQuery = this.progressionRepository
      .createQueryBuilder('p')
      .select('p.wordId')
      .where('p.userId = :userId AND p.progress > 0', { userId });

    // Основной запрос: ID слов, не входящих в подзапрос
    const words = await this.wordsRepository
      .createQueryBuilder('w')
      .select('w.id')
      .where(`w.id NOT IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .getMany();

    return words.map((word) => word.id);
  }

  /**
   * Возвращает массив слов по переданному списку ID.
   */
async getUnknownWord(listUnknownWord: number[]): Promise<Word[]> {
  if (!Array.isArray(listUnknownWord) || listUnknownWord.length === 0) {
    return [];
  }
  return this.wordsRepository.find({
    where: { id: In(listUnknownWord) },
  });
}

  /**
   * Возвращает массив слов, у которых для данного пользователя
   * прогресс находится в интервале (0, 100).
   * Если количество таких слов меньше amountWords, возвращает все найденные.
   */
async getKnownWord(userId: number, amountWords: number): Promise<Word[]> {
  if (amountWords <= 0) {
    return [];
  }

  const progressions = await this.progressionRepository
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.word', 'word')
    .where('p.userId = :userId', { userId })
    .andWhere('p.progress > 0')
    .andWhere('p.progress < 100')
    .orderBy('RANDOM()')
    .limit(amountWords) // важно: limit, а не take
    .getMany();

  return progressions.map((progression) => progression.word);
}


async getWordsProgress(userId: number) {
  return this.progressionRepository.find({
    where: { userId },
    select: { wordId: true, progress: true },
  });
}

async updateWordsProgress(userId: number, updateProgressDto: UpdateProgressDto) {
    const { ids, values } = updateProgressDto;

    if (ids.length !== values.length) {
        throw new BadRequestException('IDs and values length mismatch');
    }

    if (ids.length === 0) {
        return { success: true, updated: 0 };
    }

    try {
        const updated = await this.dataSource.transaction(async (manager) => {
            // 1. Читаем текущие значения с блокировкой строк
            const existing = await manager.find(Progression, {
                where: { userId, wordId: In(ids) },
                lock: { mode: 'pessimistic_write' },
            });

            const currentByWord = new Map(
                existing.map((e) => [e.wordId, e.progress]),
            );

            // 2. Считаем итог: current + delta, зажатый в [0, 100]
            const entries = ids.map((wordId, index) => {
                const delta = Math.round(values[index]);
                const current = currentByWord.get(wordId) ?? 0;
                const next = Math.min(100, Math.max(0, current + delta));
                return { userId, wordId, progress: next };
            });

            // 3. Пишем результат — для отсутствующих строк сработает INSERT,
            //    для существующих — UPDATE
            await manager.upsert(Progression, entries, ['userId', 'wordId']);

            return entries.length;
        });

        return {
            success: true,
            updated,
        };
    } catch (error) {
        throw new BadRequestException('Failed to update progress: ' + error.message);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
  async create(createWordDto: CreateWordDto): Promise<Word> {
    const newWord = this.wordsRepository.create(createWordDto);
    return await this.wordsRepository.save(newWord);
  }

    async findOne(id: number): Promise<Word> {
    const word = await this.wordsRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException(`Word with id ${id} not found`);
    }
    return word;
  }

  async update(id: number, updateWordDto: UpdateWordDto): Promise<Word> {
    const word = await this.findOne(id); 
    // Обновляем только переданные поля
    const updated = Object.assign(word, updateWordDto);
    return await this.wordsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.wordsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Word with id ${id} not found`);
    }
  }
}


   

