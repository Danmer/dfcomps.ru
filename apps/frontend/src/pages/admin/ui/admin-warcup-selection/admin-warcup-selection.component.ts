import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapType, WarcupStateInterface, WarcupSuggestionStatsInterface, WarcupVotingInterface, WarcupVotingState } from '@dfcomps/contracts';
import { AdminWarcupDataService } from '~pages/admin/business/admin-warcup-data.service';

@Component({
  selector: 'admin-warcup-selection',
  templateUrl: './admin-warcup-selection.component.html',
  styleUrls: ['./admin-warcup-selection.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWarcupSelectionComponent implements OnInit {
  public title: string;
  public warcupSuggestionStats: WarcupSuggestionStatsInterface;
  public selectedMap: string;
  public isLoading = true;
  public warcupVotingState: WarcupVotingState | null = null;
  public warcupVotingStates = WarcupVotingState;
  public nextMapType: string;
  public nextStateStartTime: string | null;
  public warcupVotingInfo: WarcupVotingInterface;

  constructor(
    private adminWarcupDataService: AdminWarcupDataService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getWarcupState();
  }

  public onTimerFinished(): void {
    location.reload();
  }

  private getWarcupState(): void {
    this.adminWarcupDataService.getWarcupState$().subscribe((warcupState: WarcupStateInterface) => {
      this.title = this.mapStateToComponentTitle(warcupState.state);
      this.nextMapType = this.mapMapTypeToString(warcupState.nextMapType);
      this.nextStateStartTime = warcupState.nextStateStartTime;
      this.warcupVotingState = warcupState.state;

      if (warcupState.state === WarcupVotingState.WAITING || warcupState.state === WarcupVotingState.PAUSED) {
        this.getSuggestionStats();
      }

      if (warcupState.state === WarcupVotingState.VOTING || warcupState.state === WarcupVotingState.CLOSING) {
        this.getWarcupVotingInfo();
      }
    });
  }

  private getSuggestionStats(): void {
    this.adminWarcupDataService
      .getWarcupSuggestionStats$()
      .subscribe((warcupSuggestionStats: WarcupSuggestionStatsInterface) => {
        this.warcupSuggestionStats = warcupSuggestionStats;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  private getWarcupVotingInfo(): void {
    this.adminWarcupDataService.getWarcupVotingInfo$().subscribe((warcupVotingInfo: WarcupVotingInterface) => {
      this.warcupVotingInfo = warcupVotingInfo;
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private mapStateToComponentTitle(votingState: WarcupVotingState): string {
    return {
      [WarcupVotingState.CLOSING]: 'Warcup voting finished, waiting for Warcup start',
      [WarcupVotingState.PAUSED]: 'Warcups are currently paused',
      [WarcupVotingState.VOTING]: 'Warcup voting is in progress',
      [WarcupVotingState.WAITING]: 'Waiting for the next warcup vote',
    }[votingState];
  }

  private mapMapTypeToString(mapType: MapType): string {
    return {
      [MapType.STRAFE]: 'strafe / slick / accuracy',
      [MapType.WEAPON]: 'single weapon / combo weapons',
      [MapType.EXTRA]: 'extra (long and hard map)',
    }[mapType];
  }
}
