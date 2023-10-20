import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminOperationType } from '../../models/admin-operation-type.enum';
import * as moment from 'moment';
import { debounceTime, Observable, startWith, switchMap } from 'rxjs';
import { AdminEditNewsInterface } from '@dfcomps/contracts';

@Component({
  selector: 'admin-add-simple-news',
  templateUrl: './admin-simple-news.component.html',
  styleUrls: ['./admin-simple-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSimpleNewsComponent implements OnInit {
  public operationType: AdminOperationType;
  public addSimpleNewsForm: FormGroup;
  public youtubeEmbedId$: Observable<string>;
  private newsId: string;

  constructor(
    private adminDataService: AdminDataService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.operationType = this.activatedRoute.snapshot.params['action'];
    this.newsId = this.activatedRoute.snapshot.params['id'];
    this.initForm();
  }

  public submitNews(): void {
    Object.keys(this.addSimpleNewsForm.controls).forEach((key: string) =>
      this.addSimpleNewsForm.get(key)!.markAsDirty(),
    );

    if (!this.addSimpleNewsForm.valid) {
      return;
    }

    if (this.operationType === AdminOperationType.ADD) {
      this.adminDataService
        .postSimpleNews$(this.addSimpleNewsForm.value)
        .pipe(switchMap(() => this.adminDataService.getAllNews$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/news']);
          this.snackBar.open('News added successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.operationType === AdminOperationType.EDIT) {
      this.adminDataService
        .editSimpleNews$(this.addSimpleNewsForm.value, this.newsId)
        .pipe(switchMap(() => this.adminDataService.getAllNews$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/news']);
          this.snackBar.open('News edited successfully', 'OK', { duration: 3000 });
        });
    }
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public postingTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const timeOption: string = control.get('timeOption')!.value;

      if (timeOption === 'now') {
        return null;
      }

      if (control.get('postingTime')!.value) {
        return null;
      }

      return { postingTimeEmpty: { value: control.get('postingTime')!.value } };
    };
  }

  // TODO Move out to mappers after typization
  private mapDateTimeZoneToInput(datetimezone: string): string {
    return moment(datetimezone).format('YYYY-MM-DDTHH:mm');
  }

  private initForm(): void {
    if (this.operationType === AdminOperationType.ADD) {
      this.addSimpleNewsForm = new FormGroup(
        {
          russianTitle: new FormControl('', Validators.required),
          englishTitle: new FormControl('', Validators.required),
          timeOption: new FormControl('now', Validators.required),
          postingTime: new FormControl(''),
          russianText: new FormControl('', Validators.required),
          englishText: new FormControl('', Validators.required),
          youtube: new FormControl(''),
        },
        this.postingTimeValidator(),
      );

      this.setYoutubeFieldObservable();
    }

    if (this.operationType === AdminOperationType.EDIT) {
      this.adminDataService.getSingleNews$(this.newsId).subscribe((singleNews: AdminEditNewsInterface) => {
        this.addSimpleNewsForm = new FormGroup(
          {
            russianTitle: new FormControl(singleNews.newsItem.headerRussian, Validators.required),
            englishTitle: new FormControl(singleNews.newsItem.headerEnglish, Validators.required),
            timeOption: new FormControl('custom', Validators.required),
            postingTime: new FormControl(this.mapDateTimeZoneToInput(singleNews.newsItem.date)),
            russianText: new FormControl(singleNews.newsItem.textRussian, Validators.required),
            englishText: new FormControl(singleNews.newsItem.textEnglish, Validators.required),
            youtube: new FormControl(singleNews.newsItem.youtube),
          },
          this.postingTimeValidator(),
        );

        this.changeDetectorRef.markForCheck();
        this.setYoutubeFieldObservable();
      });
    }
  }

  private setYoutubeFieldObservable(): void {
    this.youtubeEmbedId$ = this.addSimpleNewsForm
      .get('youtube')!
      .valueChanges.pipe(debounceTime(300), startWith(this.addSimpleNewsForm.get('youtube')!.value));
  }
}
