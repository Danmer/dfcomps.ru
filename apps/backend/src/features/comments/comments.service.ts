import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CommentActionResult,
  CommentActionResultInterface,
  CommentInterface,
  PersonalSmileInterface,
} from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { News } from '../../shared/entities/news.entity';
import { NewsComment } from '../../shared/entities/news-comment.entity';
import { Smile } from '../../shared/entities/smile.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Smile) private readonly smilesRepository: Repository<Smile>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    private readonly authService: AuthService,
  ) {}

  public async getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    const allSmiles: Smile[] = await this.smilesRepository
      .createQueryBuilder('smiles')
      .leftJoinAndSelect('smiles.user', 'users')
      .where('smiles.userId IS NOT NULL')
      .getMany();

    return allSmiles.map((smile: Smile) => ({
      playerId: smile.user?.id || null,
      smileAlias: smile.alias,
    }));
  }

  public async addComment(accessToken: string | undefined, text: string, newsId: number): Promise<CommentInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException('Cannot post as anonymous user');
    }

    if (moment(userAccess.commentsBanDate).isAfter(moment())) {
      const humanDateTime = moment(userAccess.commentsBanDate).format('DD MMM YYYY');

      throw new BadRequestException(`Comments banned until ${humanDateTime}`);
    }

    const news: News | null = await this.newsRepository.createQueryBuilder('news').where({ id: newsId }).getOne();

    if (!news) {
      throw new NotFoundException(`News with id = ${newsId} not found`);
    }

    const isCorrectTime: boolean = moment(news.datetimezone).isBefore(moment());

    if (!isCorrectTime) {
      throw new BadRequestException("Can't add comment before posting time");
    }

    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new BadRequestException('Comment is empty');
    }

    await this.newsCommentsRepository
      .createQueryBuilder()
      .insert()
      .into(NewsComment)
      .values([
        {
          comment: trimmedText,
          datetimezone: moment().format(),
          reason: '',
          user: { id: userAccess.userId },
          news: { id: newsId },
        },
      ])
      .execute();

    const updatedComments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'users')
      .where('news_comments.newsId = :newsId', { newsId })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    return updatedComments.map((newsComment: NewsComment) => ({
      commentId: newsComment.id,
      comment: newsComment.comment,
      datetimezone: newsComment.datetimezone,
      playerId: newsComment.user.id,
      reason: newsComment.reason,
      username: newsComment.user.displayed_nick,
    }));
  }

  public async updateComment(
    accessToken: string | undefined,
    text: string,
    commentId: number,
  ): Promise<CommentActionResultInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException('Cannot post as anonymous user');
    }

    if (moment(userAccess.commentsBanDate).isAfter(moment())) {
      throw new BadRequestException(`Comments banned until ${userAccess.commentsBanDate}`);
    }

    const newsComment: NewsComment | null = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.news', 'news')
      .where({ id: commentId })
      .andWhere('news_comments.userId = :userId', { userId: userAccess.userId })
      .getOne();

    if (!newsComment) {
      throw new UnauthorizedException(`No access to updating comment with id ${commentId}`);
    }

    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new BadRequestException('Comment is empty');
    }

    const isTooLateToEdit: boolean = moment().isAfter(moment(newsComment.datetimezone).add(2, 'minute'));
    let result: CommentActionResult;

    if (!isTooLateToEdit) {
      await this.newsCommentsRepository
        .createQueryBuilder()
        .update(NewsComment)
        .set({ comment: trimmedText })
        .where({ id: commentId })
        .execute();

      result = CommentActionResult.SUCCESS;
    } else {
      result = CommentActionResult.TWO_MINUTES;
    }

    const updatedComments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'users')
      .where('news_comments.newsId = :newsId', { newsId: newsComment.news.id })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    return {
      result,
      comments: updatedComments.map((newsComment: NewsComment) => ({
        commentId: newsComment.id,
        comment: newsComment.comment,
        datetimezone: newsComment.datetimezone,
        playerId: newsComment.user.id,
        reason: newsComment.reason,
        username: newsComment.user.displayed_nick,
      })),
    };
  }

  public async deleteComment(
    accessToken: string | undefined,
    commentId: number,
  ): Promise<CommentActionResultInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException('Cannot post as anonymous user');
    }

    const newsComment: NewsComment | null = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.news', 'news')
      .where({ id: commentId })
      .andWhere('news_comments.userId = :userId', { userId: userAccess.userId })
      .getOne();

    if (!newsComment) {
      throw new UnauthorizedException(`No access to deleting comment with id ${commentId}`);
    }

    const isTooLateToDelete: boolean = moment().isAfter(moment(newsComment.datetimezone).add(2, 'minute'));
    let result: CommentActionResult;

    if (!isTooLateToDelete) {
      await this.newsCommentsRepository
        .createQueryBuilder('news_comments')
        .delete()
        .from(NewsComment)
        .where({ id: commentId })
        .execute();

      result = CommentActionResult.SUCCESS;
    } else {
      result = CommentActionResult.TWO_MINUTES;
    }

    const updatedComments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'users')
      .where('news_comments.newsId = :newsId', { newsId: newsComment.news.id })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    return {
      result,
      comments: updatedComments.map((newsComment: NewsComment) => ({
        commentId: newsComment.id,
        comment: newsComment.comment,
        datetimezone: newsComment.datetimezone,
        playerId: newsComment.user.id,
        reason: newsComment.reason,
        username: newsComment.user.displayed_nick,
      })),
    };
  }

  public async moderatorDeleteComment(
    accessToken: string | undefined,
    commentId: number,
    reason: string,
  ): Promise<CommentInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.MODERATOR])) {
      throw new UnauthorizedException('No access to moderate comment');
    }

    const newsComment: NewsComment | null = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.news', 'news')
      .where({ id: commentId })
      .getOne();

    if (!newsComment) {
      throw new NotFoundException(`Comment with id = ${commentId} not found`);
    }

    await this.newsCommentsRepository
      .createQueryBuilder()
      .update(NewsComment)
      .set({ reason })
      .where({ id: commentId })
      .execute();

    const updatedComments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'users')
      .where('news_comments.newsId = :newsId', { newsId: newsComment.news.id })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    return updatedComments.map((newsComment: NewsComment) => ({
      commentId: newsComment.id,
      comment: newsComment.comment,
      datetimezone: newsComment.datetimezone,
      playerId: newsComment.user.id,
      reason: newsComment.reason,
      username: newsComment.user.displayed_nick,
    }));
  }
}
