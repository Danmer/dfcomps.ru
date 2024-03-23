import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './ui/admin-page/admin-page.component';
import { AdminMenuItemComponent } from './ui/admin-menu-item/admin-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AdminNewsComponent } from './ui/admin-news/admin-news.component';
import { AdminCupsComponent } from './ui/admin-cups/admin-cups.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminValidateComponent } from './ui/admin-validate/admin-validate.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminNewsActionComponent } from './ui/admin-news-action/admin-news-action.component';
import { QuillModule } from 'ngx-quill';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminSeasonComponent } from './ui/admin-season/admin-season.component';
import { HasAdminRights } from './business/has-admin-rights.guard';
import { SharedModule } from '~shared/modules/shared.module';
import { HasAdminPanelAccess } from './business/has-admin-panel-access.guard';
import { AdminOfflineCupComponent } from './ui/admin-offline-cup/admin-offline-cup.component';
import { AdminRedirectComponent } from './ui/admin-redirect/admin-redirect.component';
import { AdminOnlineCupComponent } from './ui/admin-online-cup/admin-online-cup.component';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    canActivate: [HasAdminPanelAccess],
    children: [
      { path: '', component: AdminRedirectComponent },
      {
        path: 'news',
        children: [
          {
            path: '',
            component: AdminNewsComponent,
          },
          {
            path: ':action',
            children: [{
              path: ':newsType',
              children: [
                {
                  path: '',
                  component: AdminNewsActionComponent,
                },
                {
                  path: ':id',
                  component: AdminNewsActionComponent,
                },
              ],
            }],
          },
        ],
      },
      {
        path: 'cups',
        children: [
          { path: '', component: AdminCupsComponent },
          { path: 'offline/add', component: AdminOfflineCupComponent, data: { multicup: false } },
          { path: 'offline/edit/:id', component: AdminOfflineCupComponent },
          { path: 'multicup-round/add', component: AdminOfflineCupComponent, data: { multicup: true } },
          { path: 'online/add', component: AdminOnlineCupComponent },
          { path: 'online/edit/:id', component: AdminOnlineCupComponent },
        ],
      },
      {
        path: 'validate',
        children: [
          {
            path: ':id',
            component: AdminValidateComponent,
          },
        ],
      },
      {
        path: 'season',
        children: [{ path: '', component: AdminSeasonComponent }],
        canActivate: [HasAdminRights],
      },
    ],
  },
];

@NgModule({
  declarations: [
    AdminPageComponent,
    AdminMenuItemComponent,
    AdminNewsComponent,
    AdminCupsComponent,
    AdminValidateComponent,
    AdminNewsActionComponent,
    AdminSeasonComponent,
    AdminOfflineCupComponent,
    AdminOnlineCupComponent,
  ],
  imports: [
    RouterModule.forChild(adminRoutes),
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SharedModule,
    CommonModule,
    MatSnackBarModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
    QuillModule.forRoot(),
  ],
  providers: [HasAdminPanelAccess, HasAdminRights],
})
export class AdminModule {}
