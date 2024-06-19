import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { range } from 'lodash';
import { CupRegistrationService } from '../../services/cup-registration/cup-registration.service';
import { filter, map, take, withLatestFrom } from 'rxjs';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { isNonNull } from '~shared/helpers';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { NewsOnlineAnnounceInterface, RegisteredPlayerInterface } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

@Component({
  selector: 'app-news-online-announce',
  templateUrl: './news-online-announce.component.html',
  styleUrls: ['./news-online-announce.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsOnlineAnnounceComponent implements OnInit, OnChanges {
  @Input() news: NewsOnlineAnnounceInterface;

  public range = range;
  public columnCount = 4;
  public rowCount = 10;
  public isRegistered: boolean;
  public registeredPlayers: RegisteredPlayerInterface[];
  public currentStream = 0;
  public showStreamersTimerLink$: Observable<boolean>;

  constructor(
    private cupRegistrationService: CupRegistrationService,
    private userService: UserService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.showStreamersTimerLink$ = this.userService.getCurrentUser$().pipe(
      take(1),
      map((user) => !!user && checkUserRoles(user.roles, [UserRoles.STREAMER])),
    );
  }

  ngOnChanges({ news }: SimpleChanges): void {
    if (news && news.currentValue) {
      this.isRegistered = this.news.isRegistered;
      this.registeredPlayers = this.news.registeredPlayers;
    }
  }

  public toggleRegistration(): void {
    if (this.isRegistered) {
      this.cupRegistrationService
        .cancelRegistrationForCup$(this.news.cupId!)
        .pipe(
          withLatestFrom(this.userService.getCurrentUser$().pipe(filter(isNonNull))),
          filter(([, user]: [void, UserInterface]) => !!user),
        )
        .subscribe(([, user]: [void, UserInterface]) => {
          this.isRegistered = false;
          this.registeredPlayers = this.registeredPlayers.filter(({ id }: RegisteredPlayerInterface) => id !== user.id);
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.cupRegistrationService
        .registerForCup$(this.news.cupId!)
        .pipe(
          withLatestFrom(this.userService.getCurrentUser$().pipe(filter(isNonNull))),
          filter(([, user]: [void, UserInterface]) => !!user),
        )
        .subscribe(([, { country, id, nick }]: [void, UserInterface]) => {
          this.isRegistered = true;
          this.registeredPlayers = [
            ...this.registeredPlayers,
            {
              country,
              id,
              nick,
            },
          ];
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  public openFullTable(): void {
    this.router.navigate(['/cup/online'], { queryParams: { id: this.news.cupId } });
  }

  public changeStream(streamNumber: number): void {
    this.currentStream = streamNumber;
  }

  public goToStreamersTimer(): void {
    this.router.navigate([`/timer/${this.news.timerId}`]);
  }
}
