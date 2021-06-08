import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.page.html',
  styleUrls: ['./qr-code-scanner.page.scss'],
})
export class QrCodeScannerPage implements OnInit {

  qrData = 'https://google.com';
  scannedCode = null;
  elementType: 'url' | 'canvas' | 'img' = 'canvas';
  
  constructor(public navCtrl: NavController,private barcodeScanner: BarcodeScanner, private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  goBackPage(){
    this.navCtrl.navigateForward('');
  }

  scanCode(){
    this.barcodeScanner.scan().then(
      barcodeData => {
        this.scannedCode = barcodeData;
      }
    );
  }

  downloadQR() {
    
  }
}
