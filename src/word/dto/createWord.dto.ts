import { IsNotEmpty, IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateWordDto {
  @IsNotEmpty({ message: 'Поле eng обязательно' })
  @IsString()
  @MaxLength(255)
  eng: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  transcription?: string | null;

  @IsNotEmpty({ message: 'Поле translation обязательно' })
  @IsString()
  translation: string;

  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL' })
  @MaxLength(2048)
  pronunciationUrl?: string | null;
}