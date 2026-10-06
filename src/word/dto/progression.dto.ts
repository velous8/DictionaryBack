import { IsArray, IsInt, Min, Max, ArrayMinSize } from 'class-validator';

export class UpdateProgressDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one word ID must be provided' })
  @IsInt({ each: true })
  @Min(1, { each: true }) // предполагаем, что ID слов положительные
  ids: number[];

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one progress value must be provided' })
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(100, { each: true })
  values: number[];
}