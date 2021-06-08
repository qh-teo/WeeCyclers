import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'payment-details/:id',
    loadChildren: () => import('./features/payment-details/payment-details.module').then( m => m.PaymentDetailsPageModule)
  },
  {
    path: 'add-booking',
    loadChildren: () => import('./add-booking/add-booking.module').then( m => m.AddBookingPageModule)
  },
  {
    path: 'edit-booking/:id',
    loadChildren: () => import('./edit-booking/edit-booking.module').then( m => m.EditBookingPageModule)
  },
  {
    path: 'qr-code-scanner',
    loadChildren: () => import('./qrCodeScanner/qr-code-scanner.module').then( m => m.QrCodeScannerPageModule)
  },
  {
    path: 'smart-bin-points',
    loadChildren: () => import('./smart-bin-points/smart-bin-points.module').then( m => m.SmartBinPointsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'collector',
    loadChildren: () => import('./collector/collector.module').then( m => m.CollectorPageModule)
  },
  {
    path: 'collectorpoints',
    loadChildren: () => import('./collectorpoints/collectorpoints.module').then( m => m.CollectorpointsPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'viewhistory',
    loadChildren: () => import('./viewhistory/viewhistory.module').then( m => m.ViewhistoryPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, 
      onSameUrlNavigation: 'reload' })
  ],
  providers: [
    CurrencyPipe
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
