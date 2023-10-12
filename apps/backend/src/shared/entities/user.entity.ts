import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { CupResult } from './cup-result.entity';
import { News } from './news.entity';
import { RatingChange } from './rating-change.entity';
import { NewsComment } from './news-comment.entity';
import { CupDemo } from './cup-demo.entity';
import { Smile } from './smile.entity';
import { OldRating } from './old-rating.entity';
import { Reward } from './reward.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number;

  @Column({ type: 'character varying' })
  login: string;

  @Column({ type: 'character varying' })
  displayed_nick: string;

  @Column({ type: 'character varying', nullable: true })
  password: string | null;

  @Column({ type: 'character varying', nullable: true })
  discord_tag: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_discord_prompt: string | null;

  @Column({ type: 'character varying' })
  access_token: string;

  @Column({ type: 'timestamp', nullable: true })
  last_nick_change_time: string | null;

  @Column({ type: 'integer' })
  initial_cpm_rating: number;

  @Column({ type: 'integer' })
  cpm_rating: number;

  @Column({ type: 'integer' })
  initial_vq3_rating: number;

  @Column({ type: 'integer' })
  vq3_rating: number;

  @Column({ type: 'character varying', nullable: true })
  country: string | null;

  @Column({ type: 'character varying', nullable: true })
  avatar: string | null;

  @Column({ type: 'timestamp', nullable: true })
  comments_ban_date: string | null;

  @OneToMany(() => CupResult, (cupResult) => cupResult.user)
  cupResults: CupResult[];

  @OneToMany(() => News, (news) => news.user)
  news: News[];

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.user)
  ratingChanges: RatingChange[];

  @OneToMany(() => NewsComment, (newsComment) => newsComment.user)
  newsComments: NewsComment[];

  @OneToMany(() => CupDemo, (cupDemo) => cupDemo.user)
  cupDemos: CupDemo[];

  @OneToMany(() => Smile, (smile) => smile.user)
  smiles: Smile[];

  @OneToMany(() => OldRating, (oldRating) => oldRating.user)
  oldRatings: OldRating[];

  @OneToMany(() => Reward, (reward) => reward.user)
  rewards: Reward[];
}
