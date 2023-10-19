import { IsEnum, IsNotEmpty } from 'class-validator';
import { NewsTypes } from '../news/news-types.enum';

export class PostNewsDto {
  @IsNotEmpty()
  russianTitle: string;

  @IsNotEmpty()
  englishTitle: string;

  @IsNotEmpty()
  postingTime: string;

  @IsNotEmpty()
  russianText: string;

  @IsNotEmpty()
  englishText: string;

  @IsEnum(NewsTypes)
  @IsNotEmpty()
  type: NewsTypes;

  youtube: string | null;
}
