import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Unique(['tokenHash']) 
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() 
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ 
    name: 'token_hash', 
    length: 255 
  })
  tokenHash: string;

  @Column({ 
    name: 'expires_at', 
    type: 'timestamptz' 
  })
  expiresAt: Date;

  @CreateDateColumn({ 
    name: 'created_at', 
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true
  })
  createdAt: Date;

  @Column({ 
    name: 'revoked', 
    type: 'boolean',
    default: false,
    nullable: true
  })
  revoked: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}