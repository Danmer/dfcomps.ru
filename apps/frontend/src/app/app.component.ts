import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './services/user-service/user.service';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LanguageService } from './services/language/language.service';
import { Observable, Subject } from 'rxjs';
import { UserInterface } from './interfaces/user.interface';
import { isEqual } from 'lodash';
import { DuelService } from './pages/1v1/services/duel.service';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  public user$: Observable<UserInterface | null>;

  private onDestroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
    private duelService: DuelService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser$();
    this.languageService.setLanguageFromCookie();
    this.themeService.setThemeFromCookie();
    this.initUserSubscriptions();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.duelService.closeConnection();
  }

  private initUserSubscriptions(): void {
    this.user$.pipe(distinctUntilChanged(isEqual), takeUntil(this.onDestroy$)).subscribe((user: UserInterface) => {
      if (user) {
        this.duelService.openConnection();

        return;
      }

      this.duelService.closeConnection();
    });
  }
}
