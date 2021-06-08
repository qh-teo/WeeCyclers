import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, ToastController } from '@ionic/angular';

import { QrCodeScannerPageRoutingModule } from './qr-code-scanner-routing.module';

import { QrCodeScannerPage } from './qr-code-scanner.page';
import { NgxQRCodeModule } from 'ngx-qrcode2';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrCodeScannerPageRoutingModule,
    NgxQRCodeModule
  ],
  declarations: [QrCodeScannerPage]
})
export class QrCodeScannerPageModule {
}
