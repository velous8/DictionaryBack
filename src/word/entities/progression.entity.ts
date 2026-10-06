// progression.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  UpdateDateColumn,
} from 'typeorm';
import { Word } from './word.entity';
// import { User } from './user.entity'; // если есть сущность пользователя

@Entity('progressions')
@Check('"progress" >= 0 AND "progress" <= 100') // проверка диапазона прогресса
export class Progression {
  // Составной первичный ключ (user_id, word_id)
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @PrimaryColumn({ name: 'word_id', type: 'integer' })
  wordId: number;

  // Прогресс (smallint), ограничение NOT NULL
  @Column({ type: 'smallint', nullable: false })
  progress: number;

  // Время последнего обновления — будет проставляться автоматически
  // и при вставке, и при обновлении (триггер тоже сработает)
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Связь со словом (многие прогрессы → одно слово)
  @ManyToOne(() => Word, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word: Word;

  // Связь с пользователем (если есть сущность User)
  // @ManyToOne(() => User, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: User;
}