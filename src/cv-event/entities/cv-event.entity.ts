import { Cv } from 'src/cv/entities/cv.entity';
import { CvEventType } from 'src/enums/cv-event';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity('cv_events')
export class CvEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'cvId' })
  @ManyToOne(() => Cv )
  cv: Cv;

  @Column({  type: "enum", enum: CvEventType })
  eventType: CvEventType;     

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User)
  user: User; 

  @Column({ type: 'jsonb', nullable: true })
  payload?: any;         // données supplémentaires si besoin
}
