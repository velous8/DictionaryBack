import { PartialType } from '@nestjs/mapped-types';
import { CreateWordDto } from './createWord.dto';


export class UpdateWordDto extends PartialType(CreateWordDto) {}