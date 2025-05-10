import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  
  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  reactions: { userId: number; type: string }[];

  @OneToMany(() => MessageComment, comment => comment.message, { eager: true, cascade: true })
  comments: MessageComment[];
}

@Entity('message_comments')
export class MessageComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Message, message => message.comments)
  message: Message;
}