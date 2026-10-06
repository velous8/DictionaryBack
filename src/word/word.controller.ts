import { Controller, Get, Param, Post, Body, UseGuards, Patch, Req, BadRequestException, ParseIntPipe, Delete, HttpCode, Query } from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateProgressDto } from './dto/progression.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateWordDto } from './dto/updateWord.dto';
import { CreateWordDto } from './dto/createWord.dto';


@Controller('word')
@UseGuards(JwtAuthGuard)
export class WordController {
  constructor(private readonly wordService: WordService) {}

  
  @Get()
  findAll(){
    return this.wordService.findAll();
  }
  

    @Get('/amount')
  async getWordsAmount(@Req() req: Request) {
    const userId = (req as any).user.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.wordService.getWordsAmount(userId);
  }



@Get('/idsUnknown')
getIdsUnknownWord(@Req() req: Request) {
  const userId = (req as any).user.id;
  if (!userId) throw new BadRequestException('User not authenticated');
  return this.wordService.getIdsUnknownWord(userId);
}


@Get('/unknown')
getUnknownWord(@Query('ids') ids: string) {
  const listUnknownWord = ids
    ? ids.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
    : [];
  return this.wordService.getUnknownWord(listUnknownWord);
}

  @Get('/known')
  getKnownWord(@Req() req: Request, @Query('amountWords') amountWords: number){
    const userId = (req as any).user.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.wordService.getKnownWord(userId, amountWords);
  }

  @Get('/progress')
  async getWordsProgress(@Req() req: Request) {
    const userId = (req as any).user.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.wordService.getWordsProgress(userId);
  }

  @Patch('/progress')
  async updateWordsProgress(@Req() req: Request, @Body() updateProgressDto: UpdateProgressDto) {
    const userId = (req as any).user.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.wordService.updateWordsProgress(userId, updateProgressDto);
  }
}

@Controller('admin/word')
@UseGuards(AdminGuard)
export class AdminWordController{
  constructor(private readonly wordService: WordService) {}
  
  @Post()
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordService.create(createWordDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordService.update(id, updateWordDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordService.remove(id);
  }
}