import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { LoginAvailableDto, LoginResponseDto } from '@dfcomps/contracts';

@Injectable()
export class UserService {
  private currentUser$ = new BehaviorSubject<UserInterface | null>(null);
  private accessToken$ = new BehaviorSubject<string | null>(null);

  constructor(private backendService: BackendService) {}

  public getCurrentUser$(): Observable<UserInterface | null> {
    return this.currentUser$.asObservable();
  }

  public getAccessToken$(): Observable<string | null> {
    return this.accessToken$.asObservable();
  }

  public loginByPassword$(login: string, password: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.GET_PASSWORD_TOKEN, {
        login,
        password,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseDto) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public loginByDiscord$(discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.GET_DISCORD_TOKEN, {
        discordAccessToken,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseDto) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public checkLogin$(login: string): Observable<boolean> {
    return this.backendService
      .post$<LoginAvailableDto>(URL_PARAMS.AUTH.CHECK_LOGIN, {
        login,
      })
      .pipe(map(({ loginAvailable }: LoginAvailableDto) => loginAvailable));
  }

  public register$(login: string, discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.REGISTER, {
        login,
        discordAccessToken,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseDto) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public logout(): void {
    this.currentUser$.next(null);
    this.accessToken$.next(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  public restoreAuthInfo(): void {
    try {
      const user: string | null = localStorage.getItem('user');
      const token: string | null = localStorage.getItem('token');

      if (user && token) {
        this.currentUser$.next(JSON.parse(user));
        this.accessToken$.next(JSON.parse(token));
      }
    } catch (e) {}
  }

  private setAuthInfo({ user, token }: LoginResponseDto) {
    this.currentUser$.next(user);
    this.accessToken$.next(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', JSON.stringify(token));
  }
}
