import { Model, Types } from 'mongoose';
import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordSchema } from '../schemas/word.schema';


@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private wordModel: Model<Word>) {}

  //Список всех слов
    async findAll(): Promise<Word[]> {
        return this.wordModel.find().exec();
    }

  //Список n неизвестных слов
    async getUnknownWord(body, num: number): Promise<Word[] | null> {
        const excludedIds = body.ids.map(id => new Types.ObjectId(id));
        
        return await this.wordModel.aggregate([
            { "$match": { "_id": { "$nin": excludedIds } } },
            { "$sample": { "size":  num } }
        ]).exec();
    }

  //Список n известных слов
    async getKnownWord(body): Promise<Word[] | null> {
        const excludedIds = body.ids.map(id => new Types.ObjectId(id));
        
        return await this.wordModel.aggregate([
            { "$match": { "_id": { "$in": excludedIds } } },
        ]).exec();
    }


    async getAmountWord(): Promise<Number | null> {
       return this.wordModel.countDocuments();
    }
   
}
