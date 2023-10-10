import { CommentInterface } from './comments.interface';
import { NewsTypes } from './news-types.enum';

export interface NewsInterface {
  type: NewsTypes;
  id: number;
  authorId: number;
  authorName: string;
  currentRound: number | null;
  datetimezone: string;
  header: string;
  headerEn: string;
  image: string;
  cupId: number | null;
  multicupId: number | null;
  startTime: string | null;
  text: string;
  textEn: string;
  youtube: string;
  tableJson: string;
  twitch1: string;
  twitch2: string;
  comments: CommentInterface[];
  preposted: boolean;
}
