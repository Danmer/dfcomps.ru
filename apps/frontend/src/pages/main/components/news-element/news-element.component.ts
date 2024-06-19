import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Languages, NewsInterfaceUnion, NewsTypes } from '@dfcomps/contracts';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'app-news-element',
  templateUrl: './news-element.component.html',
  styleUrls: ['./news-element.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsElementComponent implements OnInit {
  @Input() newsElement: NewsInterfaceUnion;
  @Input() isHeaderSelectable: boolean;
  @Input() areCommentsExpanded: boolean;

  @Output()
  reloadNews = new EventEmitter<void>();

  public newsTypes = NewsTypes;
  public languages = Languages;
  public language$: Observable<Languages>;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.language$ = this.languageService.getLanguage$();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }
}
