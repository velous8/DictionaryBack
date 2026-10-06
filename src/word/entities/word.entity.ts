import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  eng: string;

  @Column({ 
    name: 'transcription', 
    type: 'varchar', 
    length: 255, 
    nullable: true 
  })
  transcription: string | null;

  @Column({ type: 'text' })
  translation: string;

  @Column({ 
    name: 'pronunciation_url', 
    type: 'varchar', 
    length: 2048, 
    nullable: true 
  })
  pronunciationUrl: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}