import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../../shared/entities/match.entity';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { User } from '../../shared/entities/user.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, User, RatingChange])],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
