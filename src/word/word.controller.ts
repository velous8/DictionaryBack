import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WordService } from './word.service';
import { Word, WordSchema } from '../schemas/word.schema';

@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  findAll(){
    return this.wordService.findAll();
  }

  @Post('/unknown/:num')
  getUnknownWord( @Body() body, @Param('num') num){
    return this.wordService.getUnknownWord(body, Number(num));
  }

  @Post('/known')
  getKnownWord( @Body() body){
    return this.wordService.getKnownWord(body);
  }

  @Get('/amount')
  getAmountWord(){
    return this.wordService.getAmountWord();
  }
}