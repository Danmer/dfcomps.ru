import { CupTypes } from '@dfcomps/contracts';

export interface AdminCupDto {
  id: string;
  end_datetime: string;
  start_datetime: string;
  full_name: string;
  physics: string;
  type: CupTypes;
  rating_calculated: string;
}
