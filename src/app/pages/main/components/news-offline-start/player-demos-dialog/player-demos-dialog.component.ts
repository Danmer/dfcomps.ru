import { Languages } from '../../../../../enums/languages.enum';
import { Translations } from '../../../../../components/translations/translations.component';
import { NewsService } from '../../../../../services/news-service/news.service';
import { DemosService } from '../../../../../services/demos/demos.service';
import { UploadedDemoInterface } from '../../../../../interfaces/uploaded-demo.interface';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { formatResultTime } from '../../../../../helpers/result-time.helper';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from '../../../../../services/language/language.service';

@Component({
    selector: 'app-player-demos-dialog',
    templateUrl: './player-demos-dialog.component.html',
    styleUrls: ['./player-demos-dialog.component.less'],
})
export class PlayerDemosDialogComponent extends Translations {
    public demos$ = new BehaviorSubject<UploadedDemoInterface[]>([]);
    public loading: Record<string, boolean>;

    constructor(
        public dialogRef: MatDialogRef<PlayerDemosDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { demos: UploadedDemoInterface[]; cupName: string; cupId: string },
        private demosService: DemosService,
        private newsService: NewsService,
        protected languageService: LanguageService,
    ) {
        super(languageService);
        this.demos$.next(this.data.demos);
    }

    public getFormattedTime(time: string): string {
        return formatResultTime(time);
    }

    public deleteDemo(demoName: string): void {
        if (!confirm(this.translations.confirmDelete)) {
            return
        }

        this.loading = {
            ...this.loading,
            [demoName]: true,
        };

        this.demosService
            .deleteDemo$(demoName, this.data.cupId)
            .subscribe((demos: UploadedDemoInterface[]) => { 
                this.demos$.next(demos);
                this.newsService.loadMainPageNews();
            });
    }

    public isLoading(demoName: string): boolean {
        return !!this.loading && !!this.loading[demoName];
    }
}
