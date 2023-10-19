import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentActionResultInterface, CommentInterface, PersonalSmileInterface } from '@dfcomps/contracts';
import { AddCommentDto } from './dto/add-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ModeratorDeleteCommentDto } from './dto/moderator-delete-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('personal-smiles')
  getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    return this.commentsService.getPersonalSmiles();
  }

  @Post('add')
  addComment(
    @Body() { text, newsId }: AddCommentDto,
    @Headers('X-Auth') accessToken: string | undefined,
  ): Promise<CommentInterface[]> {
    return this.commentsService.addComment(accessToken, text, newsId);
  }

  @Post('delete')
  deleteComment(
    @Body() { commentId }: DeleteCommentDto,
    @Headers('X-Auth') accessToken: string | undefined,
  ): Promise<CommentActionResultInterface> {
    return this.commentsService.deleteComment(accessToken, commentId);
  }

  @Post('update')
  updateComment(
    @Body() { text, commentId }: UpdateCommentDto,
    @Headers('X-Auth') accessToken: string | undefined,
  ): Promise<CommentActionResultInterface> {
    return this.commentsService.updateComment(accessToken, text, commentId);
  }

  @Post('moderator_delete')
  moderatorDeleteComment(
    @Body() { commentId, reason }: ModeratorDeleteCommentDto,
    @Headers('X-Auth') accessToken: string | undefined,
  ): Promise<CommentInterface[]> {
    return this.commentsService.moderatorDeleteComment(accessToken, commentId, reason);
  }
}
