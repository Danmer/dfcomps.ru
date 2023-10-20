import { environment } from '~app/environments/environment';
import { Physics } from '@dfcomps/contracts';

const envMap: Record<string, string> = {
  local: '/legacy-api',
  'local-backend': '/legacy-api',
  prod: '/legacy-api',
};

export const MAIN_URL = envMap[environment.name];
export const API_URL = MAIN_URL;

// New backend status: 39 / 44 endpoints done
export class URL_PARAMS {
  public static get WEBSOCKET_1V1_URL(): string {
    const websocketEnvMap: Record<string, string> = {
      local: 'wss://dfcomps.ru/ws/1v1',
      'local-backend': 'ws://localhost:4002/1v1',
      prod: 'wss://dfcomps.ru/ws/1v1',
    };

    return websocketEnvMap[environment.name];
  }

  public static get MOVIES(): string {
    return `${API_URL}/movies`; // New backend done
  }

  public static get AUTH(): {
    GET_PASSWORD_TOKEN: string;
    GET_DISCORD_TOKEN: string;
    CHECK_LOGIN: string;
    REGISTER: string;
  } {
    return {
      GET_PASSWORD_TOKEN: `${API_URL}/auth/get-password-token`, // New backend done
      GET_DISCORD_TOKEN: `${API_URL}/auth/get-discord-token`, // New backend done
      CHECK_LOGIN: `${API_URL}/auth/check-login`, // New backend done
      REGISTER: `${API_URL}/auth/register`, // New backend done
    };
  }

  public static TOP_TEN_TABLE(): string {
    return `${API_URL}/tables/top10`; // New backend done
  }

  public static RATING_TABLE_PAGE(physics: Physics, page: number): string {
    return `${API_URL}/tables/rating/${physics}/${page}`; // New backend done
  }

  public static RATING_TABLE_PLAYERS_COUNT(): string {
    return `${API_URL}/tables/rating_table_players_count`; // New backend done
  }

  public static SEASON_RATING_TABLE_PAGE(physics: Physics, page: number, season: number): string {
    return `${API_URL}/tables/season_rating/${physics}/${page}/${season}`; // New backend done
  }

  public static SEASON_RATING_TABLE_PLAYERS_COUNT(season: number): string {
    return `${API_URL}/tables/season_rating_table_players_count/${season}`; // New backend done
  }

  public static get PROFILE(): {
    GET_PROFILE: (id: number) => string;
    CHECK_NICK_CHANGE: string;
    UPDATE_INFO: string;
    UPDATE_AVATAR: string;
  } {
    return {
      GET_PROFILE: (id: number) => `${API_URL}/profile/get/${id}`, // New backend done
      CHECK_NICK_CHANGE: `${API_URL}/profile/check_last_nick_change_time`, // New backend done
      UPDATE_INFO: `${API_URL}/profile/update-info`, // New backend done
      UPDATE_AVATAR: `${API_URL}/profile/update-avatar`, // New backend done
    };
  }

  public static get NEWS(): {
    MAIN_PAGE: string;
    THEME_PAGE: (theme: string) => string;
    COUNT: string;
    SINGLE_NEWS: (id: string) => string;
    ARCHIVE: (startIndex: number, endIndex: number) => string;
  } {
    return {
      MAIN_PAGE: `${API_URL}/news/mainpage`, // New backend done
      THEME_PAGE: (theme: string) => `${API_URL}/news/theme/${theme}`, // New backend done
      COUNT: `${API_URL}/news/count`, // New backend done
      SINGLE_NEWS: (id: string) => `${API_URL}/news/single/${id}`, // New backend done
      ARCHIVE: (startIndex: number, endIndex: number) => `${API_URL}/news/archive/${startIndex}/${endIndex}`, // New backend done
    };
  }

  public static get COMMENTS(): {
    ADD: string;
    DELETE: string;
    UPDATE: string;
    MODERATOR_DELETE: string;
  } {
    return {
      ADD: `${API_URL}/comments/add`, // New backend done
      DELETE: `${API_URL}/comments/delete/`, // New backend done
      UPDATE: `${API_URL}/comments/update/`, // New backend done
      MODERATOR_DELETE: `${API_URL}/comments/moderator_delete/`, // New backend done
    };
  }

  public static get SEASON(): {
    GET: string;
  } {
    return {
      GET: `${API_URL}/rating/get_season`, // New backend done
    };
  }

  public static get DEMOS(): {
    UPLOAD: string;
    DUEL_UPLOAD: string;
    DELETE: string;
  } {
    return {
      UPLOAD: `${API_URL}/demos/upload`, // New backend done
      DUEL_UPLOAD: `${API_URL}/demos/match-upload`, // New backend done
      DELETE: `${API_URL}/demos/delete`, // New backend done
    };
  }

  public static get DUEL(): {
    GET_PLAYERS_INFO: string;
  } {
    return {
      GET_PLAYERS_INFO: `${API_URL}/match/info`, // New backend done
    };
  }

  public static get TABLES(): {
    ONLINE_FULL_TABLE: (cupId: string) => string;
    ONLINE_ROUND: (cupId: string, roundNumber: string) => string;
    MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => string;
    MULTICUP_ROUND: (cupId: string, physics: Physics, roundNumber: string) => string;
  } {
    return {
      ONLINE_FULL_TABLE: (cupId: string) => `${API_URL}/tables/online/${cupId}`, // New backend done
      ONLINE_ROUND: (cupId: string, roundNumber: string) => `${API_URL}/tables/online-round/${cupId}/${roundNumber}`, // New backend done
      MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => `${API_URL}/tables/multicup/${cupId}/${physics}`, // New backend done
      MULTICUP_ROUND: (cupId: string, physics: Physics, round: string) =>
        `${API_URL}/tables/multicup-round/${cupId}/${physics}/${round}`, // New backend done
    };
  }

  public static get CUP(): {
    GET_NEXTCUP: string;
    REGISTER: (cupId: number) => string;
    CANCEL_REGISTRATION: (cupId: number) => string;
    CHECK_REGISTRATION: () => string;
    VALIDATION_ARCHIVE_LINK: (cupId: number) => string;
  } {
    return {
      GET_NEXTCUP: `${API_URL}/cup/next-cup-info`, // New backend done
      REGISTER: (cupId: number) => `${API_URL}/cup/register/${cupId}`, // Not blocking
      CANCEL_REGISTRATION: (cupId: number) => `${API_URL}/cup/cancel_registration/${cupId}`, // Not blocking
      CHECK_REGISTRATION: () => `${API_URL}/cup/is-registered`, // Not blocking
      VALIDATION_ARCHIVE_LINK: (cupId: number) => `${API_URL}/cup/validation-archive-link/${cupId}`, // Not done
    };
  }

  public static get SMILES(): {
    GET_PERSONAL_SMILES: string;
  } {
    return {
      GET_PERSONAL_SMILES: `${API_URL}/comments/personal-smiles`, // New backend done
    };
  }

  public static get ADMIN(): {
    GET_NEWS: string;
    GET_SINGLE_NEWS: (newsId: string) => string;
    POST_NEWS: string;
    UPDATE_NEWS: (newsId: string) => string;
    DELETE_NEWS: (newsId: number) => string;
    GET_CUPS: string;
    CUP_VALIDATION: (cupId: string) => string;
    PROCESS_VALIDATE: string;
    GET_ALL_ACTIVE_MULTICUPS: string;
    ADD_CUP: string;
    SET_SEASON_REWARDS: string;
    SAVE_SEASON_RATINGS: string;
    RESET_SEASON_RATINGS: string;
    INCREMENT_SEASON: string;
  } {
    return {
      GET_NEWS: `${API_URL}/admin/news/get-all-news`, // New backend done
      GET_SINGLE_NEWS: (newsId: string) => `${API_URL}/admin/news/get/${newsId}`, // New backend done
      POST_NEWS: `${API_URL}/admin/news/post`, // New backend done
      UPDATE_NEWS: (newsId: string) => `${API_URL}/admin/news/update/${newsId}`, // New backend done
      DELETE_NEWS: (newsId: number) => `${API_URL}/admin/news/delete/${newsId}`, // New backend done
      GET_CUPS: `${API_URL}/admin/cups/get_all_cups`, // Not done
      CUP_VALIDATION: (cupId: string) => `${API_URL}/admin/cups/get_cup_validation_demos/${cupId}`, // Not done
      PROCESS_VALIDATE: `${API_URL}/admin/cups/process_validate_v2`, // Not done
      GET_ALL_ACTIVE_MULTICUPS: `${API_URL}/admin/cups/get_all_active_multicups`, // Not done
      ADD_CUP: `${API_URL}/admin/cups/add_v2`, // Not done
      SET_SEASON_REWARDS: `${API_URL}/admin/season/rewards`, // Not blocking
      SAVE_SEASON_RATINGS: `${API_URL}/admin/season/save_season_ratings`, // Not blocking
      RESET_SEASON_RATINGS: `${API_URL}/admin/season/reset_season_ratings`, // Not blocking
      INCREMENT_SEASON: `${API_URL}/admin/season/increment`, // Not blocking
    };
  }
}
