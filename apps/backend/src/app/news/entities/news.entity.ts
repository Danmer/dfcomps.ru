import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Cup } from '../../cup/entities/cup.entity';
import { User } from '../../auth/entities/user.entity';
import { NewsType } from './news-type.entity';
import { NewsComment } from '../../comments/entities/news-comment.entity';

@Entity({ name: 'news' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  header: string;

  @Column({ type: 'character varying' })
  header_en: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text' })
  text_en: string;

  @Column({ type: 'character varying', nullable: true })
  youtube: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  datetime: string;

  @Column({ type: 'timestamp with time zone' })
  datetimezone: string;

  @Column({ type: 'integer' })
  comments_count: number;

  @Column({ type: 'integer', nullable: true })
  multicup_id: number;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  table_json: string;

  @Column({ type: 'character varying', nullable: true })
  twitch_1: string;

  @Column({ type: 'character varying', nullable: true })
  twitch_2: string;

  @Column({ type: 'character varying', nullable: true })
  theme: string;

  @Column({ type: 'boolean' })
  hide_on_main: boolean;

  @ManyToOne(() => Cup, { nullable: true })
  cup: Cup;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => NewsType)
  newsType: NewsType;

  @OneToMany(() => NewsComment, newsComment => newsComment.news)
  newsComments: NewsComment[];
}
