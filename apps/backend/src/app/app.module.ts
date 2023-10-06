import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { Movie } from './movies/entities/movie.entity';
import { OldUser } from './auth/entities/old-user.entity';
import { User } from './auth/entities/user.entity';
import { AuthRole } from './auth/entities/auth-role.entity';
import { TablesModule } from './tables/tables.module';
import { OneVOneRating } from './tables/entities/1v1-rating.entity';
import { Cup } from './cup/entities/cup.entity';
import { CupModule } from './cup/cup.module';
import { News } from './news/entities/news.entity';
import { CupResult } from './cup/entities/cup-result.entity';
import { NewsModule } from './news/news.module';
import { NewsType } from './news/entities/news-type.entity';
import { Multicup } from './cup/entities/multicup.entity';
import { RatingChange } from './news/entities/rating-change.entity';
import { NewsComment } from './comments/entities/news-comment.entity';
import { CommentsModule } from './comments/comments.module';
import { Smile } from './comments/entities/smile.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV === 'production' ? 'local_pgdb' : '127.0.0.1',
      port: 5432,
      username: 'user',
      password: process.env.DFCOMPS_POSTGRES_PASSWORD,
      entities: [
        User,
        OldUser,
        Movie,
        AuthRole,
        OneVOneRating,
        Cup,
        News,
        CupResult,
        NewsType,
        Multicup,
        RatingChange,
        NewsComment,
        Smile,
      ],
      database: 'dfcomps',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    MoviesModule,
    TablesModule,
    CupModule,
    NewsModule,
    CommentsModule,
  ],
})
export class AppModule {}
