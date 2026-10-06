import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,Unique} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  @Column({ 
    name: 'is_activated',
    type: 'boolean',
    default: false
  })
  isActivated: boolean;

  @Column({ 
    name: 'activation_link',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  activationLink: string | null;
}