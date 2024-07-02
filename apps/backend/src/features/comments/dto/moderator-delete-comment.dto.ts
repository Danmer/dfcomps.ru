import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ModeratorDeleteCommentDto {
  @IsNumber()
  @Transform(transformNumber)
  commentId: number;

  @IsNotEmpty()
  reason: string;
}
