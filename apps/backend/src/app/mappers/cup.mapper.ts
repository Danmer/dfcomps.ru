import { CupInterface, Physics } from '@dfcomps/contracts';
import { Cup } from '../cup/entities/cup.entity';

export function mapCupEntityToInterface(cup: Cup, isFutureCup: boolean, server: string, newsId: number | null): CupInterface {
  return {
    archiveLink: cup.archive_link,
    bonusRating: cup.bonus_rating,
    currentRound: cup.current_round,
    demosValidated: cup.demos_validated,
    startDateTime: cup.start_datetime,
    endDateTime: cup.end_datetime,
    fullName: cup.full_name,
    id: cup.id,
    map1: isFutureCup ? null : cup.map1,
    map2: cup.map2,
    map3: cup.map3,
    map4: cup.map4,
    map5: cup.map5,
    mapAuthor: isFutureCup ? null : cup.map_author,
    mapPk3: isFutureCup ? null : cup.map_pk3,
    mapSize: isFutureCup ? null : cup.map_size,
    mapWeapons: isFutureCup ? null : cup.map_weapons,
    multicupId: cup.multicup_id,
    physics: cup.physics as Physics,
    ratingCalculated: cup.rating_calculated,
    server,
    shortName: cup.short_name,
    system: cup.system,
    timer: cup.timer,
    twitch: cup.twitch,
    type: cup.type,
    useTwoServers: cup.use_two_servers,
    youtube: cup.youtube,
    newsId,
    customMap: isFutureCup ? null : cup.custom_map,
    customNews: isFutureCup ? null : cup.custom_news,
    cupId: cup.id,
  };
}
