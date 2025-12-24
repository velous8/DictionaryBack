
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WordDocument = HydratedDocument<Word>;
@Schema()
export class Word {
  @Prop({ required: true })
  eng: string;

  @Prop({ required: true })
  transcription: string;

  @Prop({ required: true })
  translation: string;
}
export const WordSchema = SchemaFactory.createForClass(Word);



