import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsPhysicsTableComponent } from './news-physics-table.component';

describe('NewsPhysicsTableComponent', () => {
    let component: NewsPhysicsTableComponent;
    let fixture: ComponentFixture<NewsPhysicsTableComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsPhysicsTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsPhysicsTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
