import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentActionResultInterface, CommentInterface } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class CommentsService extends BackendService {
  public sendComment$(text: string, newsId: number): Observable<CommentInterface[]> {
    return this.post$(URL_PARAMS.COMMENTS.ADD, {
      text,
      newsId,
    });
  }

  public deleteComment$(commentId: number): Observable<CommentActionResultInterface> {
    return this.post$(URL_PARAMS.COMMENTS.DELETE, {
      commentId,
    });
  }

  public updateComment$(text: string, commentId: number): Observable<CommentActionResultInterface> {
    return this.post$(URL_PARAMS.COMMENTS.UPDATE, {
      text,
      commentId,
    });
  }

  public moderatorDeleteComment$(commentId: number, reason: string): Observable<CommentInterface[]> {
    return this.post$(URL_PARAMS.COMMENTS.MODERATOR_DELETE, {
      commentId,
      reason,
    });
  }
}
