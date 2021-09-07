import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsReflexOfflineResultsComponent } from './news-reflex-offline-results.component';

describe('NewsReflexOfflineResultsComponent', () => {
    let component: NewsReflexOfflineResultsComponent;
    let fixture: ComponentFixture<NewsReflexOfflineResultsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsReflexOfflineResultsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsReflexOfflineResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
