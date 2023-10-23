import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AdminCupDto,
  AdminCupInterface,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
  CupTypes,
  Physics,
  ProcessValidationDto,
  ValidDemoInterface,
  ValidationResultInterface,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { DeepPartial, Repository } from 'typeorm';
import { getHumanTime } from '../../../shared/helpers/get-human-time';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles, isSuperadmin } from '@dfcomps/auth';
import * as moment from 'moment';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { TablesService } from '../../tables/tables.service';
import { User } from '../../../shared/entities/user.entity';
import { TableEntryWithRatingInterface } from './table-entry-with-rating.interface';
import { RatingChange } from '../../../shared/entities/rating-change.entity';
import { Season } from '../../../shared/entities/season.entity';

@Injectable()
export class AdminCupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
  ) {}

  public async getAllCups(accessToken: string | undefined): Promise<AdminCupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get admin cups list without CUP_ORGANIZER role');
    }

    const cups: Cup[] = await this.cupsRepository.createQueryBuilder('cups').orderBy('id', 'DESC').getMany();

    return cups.map((cup: Cup) => ({
      id: cup.id,
      fullName: cup.full_name,
      duration: getHumanTime(cup.start_datetime) + ' - ' + getHumanTime(cup.end_datetime),
      physics: cup.physics,
      type: cup.type,
      validationAvailable: cup.rating_calculated === false && cup.type === CupTypes.OFFLINE,
      calculateRatingsAvailable: cup.rating_calculated === false && cup.demos_validated === true,
    }));
  }

  public async getSingleCup(accessToken: string | undefined, cupId: number): Promise<any> {
    return {};
  }

  public async deleteCup(accessToken: string | undefined, cupId: number): Promise<void> {}

  public async addCup(accessToken: string | undefined, cupDto: AdminCupDto): Promise<void> {}

  public async updateCup(accessToken: string | undefined, cupDto: AdminCupDto, cupId: number): Promise<void> {}

  public async getValidationDemos(accessToken: string | undefined, cupId: number): Promise<AdminValidationInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to get validation demos, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isBefore(cup.end_datetime) && !isSuperadmin(userAccess.roles)) {
      throw new UnauthorizedException('Unauthorized to get demos before competition end');
    }

    return {
      cupInfo: {
        id: cupId,
        fullName: cup.full_name,
      },
      vq3Demos: await this.getPhysicsDemos(cupId, Physics.VQ3),
      cpmDemos: await this.getPhysicsDemos(cupId, Physics.CPM),
    };
  }

  public async processValidation(
    accessToken: string | undefined,
    { validationResults, allDemosCount }: ProcessValidationDto,
    cupId: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to set validation results, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    const targetEntries: Partial<CupDemo>[] = validationResults.map(
      ({ id, validationStatus, reason }: ValidationResultInterface) => ({
        id,
        reason,
        verified_status: validationStatus,
      }),
    );

    await this.cupsDemosRepository.save(targetEntries);

    if (moment().isAfter(moment(cup.end_datetime)) && targetEntries.length === allDemosCount) {
      await this.cupsRepository
        .createQueryBuilder()
        .update(Cup)
        .set({ demos_validated: true })
        .where({ id: cupId })
        .execute();
    }
  }

  public async calculateRating(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to calculate rating, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`No cup with cup id = ${cupId}`);
    }

    if (cup.rating_calculated) {
      throw new BadRequestException('Rating was already calculated');
    }

    if (!cup.demos_validated) {
      throw new BadRequestException("Can't calculate rating (demos are not validated yet)");
    }

    if (cup.type === CupTypes.OFFLINE) {
      this.calculateOfflineRating(cup, Physics.VQ3);
      this.calculateOfflineRating(cup, Physics.CPM);
    } else if (cup.type === CupTypes.ONLINE) {
      this.calculateOnlineRating(cup);
    } else {
      throw new NotImplementedException(`Unknown cup type ${cup.type}`);
    }

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({ rating_calculated: true })
      .where({ id: cupId })
      .execute();
  }

  private async getPhysicsDemos(cupId: number, physics: Physics): Promise<AdminPlayerDemosValidationInterface[]> {
    const demos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .leftJoinAndSelect('cups_demos.user', 'users')
      .where('cups_demos.cupId = :cupId', { cupId })
      .andWhere('cups_demos.physics = :physics', { physics })
      .getMany();

    const demosByPlayer: AdminPlayerDemosValidationInterface[] = demos.reduce<AdminPlayerDemosValidationInterface[]>(
      (demos: AdminPlayerDemosValidationInterface[], playerDemo: CupDemo) => {
        const playerDemoIndex = demos.findIndex(
          (demo: AdminPlayerDemosValidationInterface) => demo.nick === playerDemo.user.displayed_nick,
        );

        if (playerDemoIndex !== -1) {
          type Unpacked<T> = T extends (infer U)[] ? U : T;

          const addedDemo: Unpacked<AdminPlayerDemosValidationInterface['demos']> = {
            time: playerDemo.time,
            validationStatus: playerDemo.verified_status,
            validationFailedReason: playerDemo.reason,
            demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
            id: playerDemo.id,
          };

          demos[playerDemoIndex].demos.push(addedDemo);

          return demos;
        }

        const addedDemo: AdminPlayerDemosValidationInterface = {
          nick: playerDemo.user.displayed_nick,
          country: playerDemo.user.country,
          demos: [
            {
              time: playerDemo.time,
              validationStatus: playerDemo.verified_status,
              validationFailedReason: playerDemo.reason,
              demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
              id: playerDemo.id,
            },
          ],
        };

        return [...demos, addedDemo];
      },
      [],
    );

    const sortedDemos: AdminPlayerDemosValidationInterface[] = demosByPlayer
      .map((playerDemos: AdminPlayerDemosValidationInterface) => ({
        ...playerDemos,
        demos: playerDemos.demos.sort((demo1, demo2) => demo1.time - demo2.time),
      }))
      .sort((player1, player2) => player1.demos[0].time - player2.demos[0].time);

    return sortedDemos;
  }

  private async calculateOfflineRating(cup: Cup, physics: Physics): Promise<void> {
    let offlineCupTable: ValidDemoInterface[] = (await this.tablesService.getOfflineCupTable(cup, physics)).valid;

    const otherPhysics = cup.physics === Physics.CPM ? Physics.VQ3 : Physics.CPM;
    const otherPhysicsOfflineCupTable: ValidDemoInterface[] = (
      await this.tablesService.getOfflineCupTable(cup, otherPhysics)
    ).valid;

    let averageRating = 0;

    offlineCupTable = offlineCupTable.map((demo: ValidDemoInterface) => {
      // TODO Can be simplified if all zero points ratings are replaced by 1500 in database.
      // atm the difference between 0 and 1500 is that 0 never participated in season and won't be in the final season table.
      // so there needs to be another boolean key to indicate the difference between 0 and 1500
      const demoRating = demo.rating === 0 ? 1500 : demo.rating;

      averageRating += demoRating;

      return { ...demo, rating: demoRating };
    });

    averageRating /= offlineCupTable.length;

    let currentResultCounter = 1;
    let onlyBonusRatingPlayersCount = 0;

    let tableWithCalculatedRatings: TableEntryWithRatingInterface[] = offlineCupTable.map(
      (demo: ValidDemoInterface, index: number) => {
        let currentPlayerPlace: number;

        if (index === 0) {
          currentPlayerPlace = 1;
        } else {
          if (demo.time !== offlineCupTable[index - 1].time) {
            currentResultCounter++;
          }

          currentPlayerPlace = currentResultCounter;
        }

        const efficiency: number = 1 - (currentPlayerPlace - 1) / offlineCupTable.length;
        const expectation: number = 1 / (1 + Math.pow(10, (averageRating - demo.rating) / 400));
        let ratingChange: number = Math.round(70 * (efficiency - expectation));
        let sub2KBonusRatingChange: number = 0;

        if (demo.rating < 2000) {
          if (demo.change! < 0) {
            sub2KBonusRatingChange = 10 - onlyBonusRatingPlayersCount;
            sub2KBonusRatingChange = sub2KBonusRatingChange < 1 ? 1 : sub2KBonusRatingChange;
            onlyBonusRatingPlayersCount++;
          } else {
            sub2KBonusRatingChange = 10;
          }
        }

        ratingChange += sub2KBonusRatingChange + cup.bonus_rating;

        const hasBothPhysicsBonus: boolean = otherPhysicsOfflineCupTable.some(
          (otherDemo: ValidDemoInterface) => otherDemo.playerId === demo.playerId,
        );

        if (hasBothPhysicsBonus) {
          ratingChange += 5;
        }

        return {
          ...demo,
          ratingChange,
          hasBothPhysicsBonus,
          placeInTable: currentPlayerPlace,
        };
      },
    );

    tableWithCalculatedRatings = this.addTop3BonusRatings(tableWithCalculatedRatings);
    tableWithCalculatedRatings = this.recalculateChangeFor1700(tableWithCalculatedRatings);

    const playersUpdate: Partial<User>[] = tableWithCalculatedRatings.map(
      ({ playerId, ratingChange, rating }: TableEntryWithRatingInterface) => ({
        id: playerId,
        [`${physics}_rating`]: rating + ratingChange,
      }),
    );

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    const ratingChanges: DeepPartial<RatingChange>[] = tableWithCalculatedRatings.map(
      (tableEntry: TableEntryWithRatingInterface) => {
        return {
          cpm_change: physics === Physics.CPM ? tableEntry.ratingChange : null,
          vq3_change: physics === Physics.VQ3 ? tableEntry.ratingChange : null,
          cpm_place: physics === Physics.CPM ? tableEntry.placeInTable : null,
          vq3_place: physics === Physics.VQ3 ? tableEntry.placeInTable : null,
          bonus: tableEntry.hasBothPhysicsBonus,
          season,
          user: { id: tableEntry.playerId },
          cup: { id: cup.id },
          multicup: null,
        };
      },
    );

    await this.usersRepository.save(playersUpdate);
    await this.ratingChangesRepository.createQueryBuilder().insert().into(RatingChange).values(ratingChanges).execute();
  }

  // TODO
  private async calculateOnlineRating(cup: Cup): Promise<void> {}

  /**
   * Counting bonus points (+15 +10 +5 for 3 players, +50 +30 +20 for 30+ players)
   * @param table
   */
  private addTop3BonusRatings(table: TableEntryWithRatingInterface[]): TableEntryWithRatingInterface[] {
    const resultTable: TableEntryWithRatingInterface[] = [...table];
    let bonusCoefficientForNumberOfPlayers = (resultTable.length - 3) / 27;

    if (bonusCoefficientForNumberOfPlayers < 0) {
      bonusCoefficientForNumberOfPlayers = 0;
    }

    if (bonusCoefficientForNumberOfPlayers > 1) {
      bonusCoefficientForNumberOfPlayers = 1;
    }

    const firstPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (50 - 15) + 15);
    const secondPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (30 - 10) + 10);
    const thirdPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (20 - 5) + 5);

    resultTable[0].ratingChange += firstPlaceBonus;

    let playerIndex = 1;

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += firstPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    return resultTable;
  }

  private recalculateChangeFor1700(table: TableEntryWithRatingInterface[]): TableEntryWithRatingInterface[] {
    return table.map((tableEntry: TableEntryWithRatingInterface) => {
      let ratingChange = tableEntry.ratingChange;

      if (tableEntry.rating > 1700 && tableEntry.rating + ratingChange < 1700) {
        ratingChange = 1700 - tableEntry.rating;
      }

      return {
        ...tableEntry,
        ratingChange,
      };
    });
  }
}
