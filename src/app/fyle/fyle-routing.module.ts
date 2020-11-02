import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'my_expenses',
    loadChildren: () => import('./my-expenses/my-expenses.module').then(m => m.MyExpensesPageModule)
  },
  {
    path: 'camera_overlay',
    loadChildren: () => import('./camera-overlay/camera-overlay.module').then(m => m.CameraOverlayPageModule)
  },
  {
    path: 'my_advances',
    loadChildren: () => import('./my-advances/my-advances.module').then(m => m.MyAdvancesPageModule)
  },
  {
    path: 'team_trips',
    loadChildren: () => import('./team-trips/team-trips.module').then( m => m.TeamTripsPageModule)
  },
  {
    path: 'view_team_trips',
    loadChildren: () => import('./view-team-trip/view-team-trip.module').then( m => m.ViewTeamTripPageModule)
  },
  {
    path: 'my_profile',
    loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfilePageModule)
  },
  {
    path: 'my_trips',
    loadChildren: () => import('./my-trips/my-trips.module').then(m => m.MyTripsPageModule)
  },
  {
    path: 'my_view_trips',
    loadChildren: () => import('./my-view-trips/my-view-trips.module').then(m => m.MyViewTripsPageModule)
  },
  {
    path: 'my_reports',
    loadChildren: () => import('./my-reports/my-reports.module').then(m => m.MyReportsPageModule)
  },
  {
    path: 'my_view_report',
    loadChildren: () => import('./my-view-report/my-view-report.module').then(m => m.MyViewReportPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'my_view_advance_request',
    loadChildren: () => import('./my-view-advance-request/my-view-advance-request.module').then( m => m.MyViewAdvanceRequestPageModule)
  },
  {
    path: 'team_advance',
    loadChildren: () => import('./team-advance/team-advance.module').then( m => m.TeamAdvancePageModule)
  },
  {
    path: 'team_reports',
    loadChildren: () => import('./team-reports/team-reports.module').then( m => m.TeamReportsPageModule)
  },
  {
    path: 'view_team_report',
    loadChildren: () => import('./view-team-report/view-team-report.module').then( m => m.ViewTeamReportPageModule)
  },
  {
    path: 'my_view_expense',
    loadChildren: () => import('./my-view-expense/my-view-expense.module').then( m => m.MyViewExpensePageModule)
  },
  {
    path: 'delegated_accounts',
    loadChildren: () => import('./delegated-accounts/delegated-accounts.module').then( m => m.DelegatedAccountsPageModule)
  },
  {
    path: 'view_team_advance',
    loadChildren: () => import('./view-team-advance/view-team-advance.module').then( m => m.ViewTeamAdvancePageModule)
  },
  {
    path: 'view_team_expense',
    loadChildren: () => import('./view-team-expense/view-team-expense.module').then( m => m.ViewTeamExpensePageModule)
  },
  {
    path: 'my_view_mileage',
    loadChildren: () => import('./my-view-mileage/my-view-mileage.module').then( m => m.MyViewMileagePageModule)
  },
  {
    path: 'my_view_per_diem',
    loadChildren: () => import('./my-view-per-diem/my-view-per-diem.module').then( m => m.MyViewPerDiemPageModule)
  },
  {
    path: 'view_team_per_diem',
    loadChildren: () => import('./view-team-per-diem/view-team-per-diem.module').then( m => m.ViewTeamPerDiemPageModule)
  },
  {
    path: 'view_team_mileage',
    loadChildren: () => import('./view-team-mileage/view-team-mileage.module').then( m => m.ViewTeamMileagePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FyleRoutingModule { }