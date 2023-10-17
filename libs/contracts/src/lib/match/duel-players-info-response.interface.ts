import { DuelPlayerInfoInterface, Physics } from '@dfcomps/contracts';

export interface DuelPlayersInfoResponseInterface {
  matchId: number;
  firstPlayerId: number;
  secondPlayerId: number;
  firstPlayerTime: number | null;
  firstPlayerDemo: string | null;
  secondPlayerTime: number | null;
  secondPlayerDemo: string | null;
  startDatetime: string;
  isFinished: boolean;
  physics: Physics;
  map: string;
  firstPlayerInfo: DuelPlayerInfoInterface;
  secondPlayerInfo: DuelPlayerInfoInterface;
  firstPlayerRatingChange: number | null;
  secondPlayerRatingChange: number | null;
  securityCode: string;
}
