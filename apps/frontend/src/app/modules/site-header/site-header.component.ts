import { LanguageService } from './../../services/language/language.service';
import { Languages } from '../../enums/languages.enum';
import { NavigationPages } from '../../routing/enums/pages.enum';
import { TABS_CONFIG, TabInterface } from '../../routing/config/tabs.config';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DownloadDfDialogComponent } from './components/download-df-dialog/download-df-dialog.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  public pages = NavigationPages;
  public tabs = TABS_CONFIG.TABS;
  public languages = Languages;
  public activePage: NavigationPages | null;
  public translations: Record<string, string>;
  public language$: Observable<Languages>;

  private onDestroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setActivePage();
    this.initActivePageSubscription();
    this.language$ = this.languageService.getLanguage$();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public navigate(page: NavigationPages): void {
    this.router.navigate([`/${page}`]);
  }

  public onDownloadDefragClick(): void {
    this.dialog.open(DownloadDfDialogComponent);
  }

  public toggleLanguage(): void {
    this.languageService
      .getLanguage$()
      .pipe(take(1))
      .subscribe((language: Languages) =>
        language === Languages.EN
          ? this.languageService.setLanguage(Languages.RU)
          : this.languageService.setLanguage(Languages.EN),
      );
  }

  private initActivePageSubscription(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.onDestroy$),
      )
      .subscribe(() => {
        this.setActivePage();
        this.changeDetectorRef.markForCheck();
      });
  }

  private setActivePage(): void {
    const activeTab: TabInterface | undefined = this.tabs.find(
      ({ page }: TabInterface) => page && this.router.url.indexOf(page) !== -1,
    );

    if (this.router.url === '/') {
      this.activePage = NavigationPages.MAIN;

      return;
    }

    if (this.router.url.includes('news')) {
      this.activePage = NavigationPages.NEWS;

      return;
    }

    if (activeTab) {
      this.activePage = activeTab.page;

      return;
    }

    this.activePage = null;
  }
}
