import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import { addOfflineCup } from '../support/offline-cup-operations';
import * as faker from 'faker';
import * as moment from 'moment';

describe('admin offline cups news', () => {
  let fullNameFirstCup: string;
  let fullNameSecondCup: string;
  const firstCupMap = 'crosspath';
  const secondCupMap = 'st1';
  const initialRussianTitle = faker.lorem.words();
  const initialEnglishTitle = faker.lorem.words();
  const initialRussianText = faker.lorem.words();
  const initialEnglishText = faker.lorem.words();
  const initialYoutubeId = 'hN6VNnOPYaw';
  const editedRussianTitle = faker.lorem.words();
  const editedEnglishTitle = faker.lorem.words();
  const editedRussianText = faker.lorem.words();
  const editedEnglishText = faker.lorem.words();
  const editedYoutubeId = 'g_JzrGR-jDY';

  before(() => {
    fullNameFirstCup = addOfflineCup(firstCupMap);
    fullNameSecondCup = addOfflineCup(secondCupMap, { needToLogin: false });
    logOut({ isHeaderVisible: false });
  });

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add start offline cup news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Offline cup start').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(initialRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(initialEnglishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().subtract('1', 'day').format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(initialRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(initialEnglishText);
    cy.get('[data-test-id=youtube-input]').type(initialYoutubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(fullNameFirstCup).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', initialEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', initialYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialEnglishText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=cup-map-link]').first().should('contain.text', firstCupMap);
  });

  it('should edit start offline cup news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=edit-news-button]').first().click();

    cy.get('[data-test-id=russian-news-title-input]').clear().type(editedRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').clear().type(editedEnglishTitle);
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').clear().type(editedRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').clear().type(editedEnglishText);
    cy.get('[data-test-id=youtube-input]').clear().type(editedYoutubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(fullNameSecondCup).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', editedEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', editedYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedEnglishText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=cup-map-link]').first().should('contain.text', secondCupMap);
  });

  it('should add offline cup results news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Offline cup results').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(initialRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(initialEnglishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().subtract('1', 'hour').format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(initialRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(initialEnglishText);
    cy.get('[data-test-id=youtube-input]').type(initialYoutubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(fullNameFirstCup).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', initialEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', initialYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialEnglishText);
    cy.get('[data-test-id=language-toggle]').click();

    cy.get('[data-test-id=offline-results-map-link]').first().should('contain.text', firstCupMap);
  });

  it('should edit offline cup results news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=edit-news-button]').first().click();

    cy.get('[data-test-id=russian-news-title-input]').clear().type(editedRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').clear().type(editedEnglishTitle);
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').clear().type(editedRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').clear().type(editedEnglishText);
    cy.get('[data-test-id=youtube-input]').clear().type(editedYoutubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(fullNameSecondCup).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', editedEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', editedYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedEnglishText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=offline-results-map-link]').first().should('contain.text', secondCupMap);
  });
});
