import { HttpClient } from '@angular/common/http';
import { SmartBin } from '../shared/models/smartBins';
import LatLonEllipsoidal, { Dms } from '../shared/latlon-ellipsoidal.js';
import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { GoogleCloudVisionServiceService } from '../google-cloud-vision-service.service';
import { Router, NavigationExtras } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-collector',
  templateUrl: './collector.page.html',
  styleUrls: ['./collector.page.scss'],
})
export class CollectorPage extends LatLonEllipsoidal {
  private currentColor: string
  scannedCode = null;
  elementType: 'url' | 'canvas' | 'img' = 'canvas';

  smartBins: any = [];
  π: any = Math.PI;
  ε: Number = Number.EPSILON;
  selectedfeature: "LABEL_DETECTION";
  constructor(public http: HttpClient,
    public navCtrl: NavController,
    private camera: Camera,
    private vision: GoogleCloudVisionServiceService,
    private route: Router,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private barcodeScanner: BarcodeScanner, 
    private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController
  ) {
    super();
    this.currentColor = 'light';
    this.successfulToast();
    // this.smartBins = [
    //   new SmartBin('Bin A','1','1.4067, 103.9022'),
    //   new SmartBin('Bin B','2','1.3968,103.9090'),
    //   new SmartBin('Bin C','3','1.4024,103.9132')
    // ]   

  }

  goBackPage(){
    this.navCtrl.navigateForward('');
  }

  async successfulToast(){
    const toast = await this.toastCtrl.create({
      message: 'Welcome Collector!.',
      duration: 2000,
      position: 'top',
      color: 'secondary'
      });
      toast.present();
  } 
  
  scanCode(){
    this.barcodeScanner.scan().then(
      barcodeData => {
        this.scannedCode = barcodeData;
        if(this.scannedCode){
          this.openQR(true);
        }
      }
    );
  }

  async collectOpenQR(scanResult) {
    if(scanResult == true){
      this.navCtrl.navigateForward('collectorpoints');
    }
  }

  async openQR(scanResult) {
    if(scanResult == true){
      this.navCtrl.navigateForward('smart-bin-points');
    }
  }
  
  goQRPage(){
    this.navCtrl.navigateForward('qr-code-scanner');
  }

  ngOnInit() {
    this.getSmartBins()
  }
  
  async getSmartBins() {
    var url = 'https://weecycle-db.herokuapp.com/getSmartBins';
    this.http.get(url).subscribe(data => {
      var tmpsmartBins: any = [];
      for(var i = 0; i < Object.keys(data).length; i++){
        var dLatLng = data[i].sLatsLng.split(",");
        //console.log(data[i]);
        var dPoints = {lat: parseFloat(dLatLng[0]), lon: parseFloat(dLatLng[1])};
        var dist = this.distanceTo(dPoints);
        if(dist < 500){
          tmpsmartBins.push(data[i]);
          //tmpsmartBins += data[i];
        }
        console.log(tmpsmartBins);
        this.smartBins = tmpsmartBins;
        //console.log(tmpsmartBins);
        //this.smartBins = tmpsmartBins;
        // if(this.distanceTo(dPoints) < 500){
        //   console.log(this.distanceTo(dPoints));
        //   this.smartBins += data[i];
        // }
      }
      
    })
  }

  

  /**
     * Returns the distance between ‘this’ point and destination point along a geodesic on the
     * surface of the ellipsoid, using Vincenty inverse solution.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Distance in metres between points or NaN if failed to converge.
     *
     * @example
     *   const p1 = new LatLon(50.06632, -5.71475);
     *   const p2 = new LatLon(58.64402, -3.07009);
     *   const d = p1.distanceTo(p2); // 969,954.166 m
     */
  distanceTo(point) {
    try {
      const dist = this.inverse(point);
      return dist; // round to 1mm precision
    } catch (e) {
      if (e instanceof EvalError) return NaN; // λ > π or failed to converge
      throw e;
    }
  }
  
  /**
   * Vincenty inverse calculation.
   *
   * Ellipsoid parameters are taken from datum of 'this' point. Height is ignored.
   *
   * @private
   * @param   {LatLon} point - Latitude/longitude of destination point.
   * @returns {Object} Object including distance, initialBearing, finalBearing.
   * @throws  {TypeError}  Invalid point.
   * @throws  {RangeError} Points must be on surface of ellipsoid.
   * @throws  {EvalError}  Formula failed to converge.
   */
  inverse(point) {
    //if (!(point instanceof LatLonEllipsoidal)) throw new TypeError(`invalid point ‘${point}’`);
    //if (this.height!=0 || point.height!=0) throw new RangeError('point must be on the surface of the ellipsoid');

    var p1: Array<number> = [1.3793486365503822, 103.84985646645747];
    const p2 = point;
    const φ1 = p1[0] * (this.π / 180);
    const λ1 = p1[1] * (this.π / 180);
    const φ2 = p2.lat * (this.π / 180);
    const λ2 = p2.lon * (this.π / 180);
    

    // allow alternative ellipsoid to be specified
    const ellipsoid = LatLonEllipsoidal.datum ? LatLonEllipsoidal.datum.ellipsoid : LatLonEllipsoidal.ellipsoids.WGS84;
    const { a, b, f } = ellipsoid;

    const L = λ2 - λ1; // L = difference in longitude, U = reduced latitude, defined by tan U = (1-f)·tanφ.
    const tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
    const tanU2 = (1 - f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;

    const antipodal = Math.abs(L) > this.π / 2 || Math.abs(φ2 - φ1) > this.π / 2;

    let λ = L, sinλ = null, cosλ = null; // λ = difference in longitude on an auxiliary sphere
    
    let σ = antipodal ? this.π : 0, sinσ = 0, cosσ = antipodal ? -1 : 1, sinSqσ = null; // σ = angular distance P₁ P₂ on the sphere
    let cos2σₘ = 1;                      // σₘ = angular distance on the sphere from the equator to the midpoint of the line
    let sinα = null, cosSqα = 1;         // α = azimuth of the geodesic at the equator
    let C = null;

    let λʹ = null, iterations = 0;
    do {
      sinλ = Math.sin(λ);
      cosλ = Math.cos(λ);
      
      sinSqσ = (cosU2 * sinλ) * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
      if (Math.abs(sinSqσ) < this.ε) break;  // co-incident/antipodal points (falls back on λ/σ = L)
      sinσ = Math.sqrt(sinSqσ);
      cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
      σ = Math.atan2(sinσ, cosσ);
      sinα = cosU1 * cosU2 * sinλ / sinσ;
      
      cosSqα = 1 - sinα * sinα;
      cos2σₘ = (cosSqα != 0) ? (cosσ - 2 * sinU1 * sinU2 / cosSqα) : 0; // on equatorial line cos²α = 0 (§6)
      C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
      λʹ = λ;
      λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
      const iterationCheck = antipodal ? Math.abs(λ) - this.π : Math.abs(λ);
      if (iterationCheck > this.π) throw new EvalError('λ > π');
    } while (Math.abs(λ - λʹ) > 1e-12 && ++iterations < 1000);
    if (iterations >= 1000) throw new EvalError('Vincenty formula failed to converge');

    const uSq = cosSqα * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
      B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
   
    const s = b * A * (σ - Δσ); // s = length of the geodesic

    // note special handling of exactly antipodal points where sin²σ = 0 (due to discontinuity
    // atan2(0, 0) = 0 but atan2(ε, 0) = π/2 / 90°) - in which case bearing is always meridional,
    // due north (or due south!)
    // α = azimuths of the geodesic; α2 the direction P₁ P₂ produced
    const α1 = Math.abs(sinSqσ) < this.ε ? 0 : Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
    const α2 = Math.abs(sinSqσ) < this.ε ? this.π : Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);
    
    return s;
    
  }
  
}