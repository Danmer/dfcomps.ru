import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../modules/cup-timer/helpers/cup-time-format.helpers';
import { ENGLISH_TRANSLATIONS } from '../../translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from '../../translations/ru.translations';
import { Languages } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private language$ = new ReplaySubject<Languages>(1);

  public getLanguage$(): Observable<Languages> {
    return this.language$.asObservable();
  }

  public setLanguage(language: Languages): void {
    localStorage.setItem('language', language);
    this.language$.next(language);
  }

  public setLanguageFromCookie(): void {
    this.setLanguage((this.getLanguageFromCookie() as Languages) || Languages.RU);
  }

  public getFormattedCupTime$(dateTime: string): Observable<string> {
    return this.getLanguage$().pipe(map((language: Languages) => formatCupTime(dateTime, language)));
  }

  public getTranslations$(): Observable<Record<string, string>> {
    return this.getLanguage$().pipe(
      map((language: Languages) => (language === Languages.EN ? ENGLISH_TRANSLATIONS : RUSSIAN_TRANSLATIONS)),
    );
  }

  public getTranslation$(translation: string): Observable<string> {
    return this.getTranslations$().pipe(map((translations: Record<string, string>) => translations[translation]));
  }

  private getLanguageFromCookie(): Languages {
    return localStorage.getItem('language') as Languages;
  }
}
