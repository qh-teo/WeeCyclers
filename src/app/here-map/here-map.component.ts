import { Component, OnInit, ViewChild, ElementRef, Input,OnChanges,SimpleChanges } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import LatLonEllipsoidal, { Dms } from '../shared/latlon-ellipsoidal.js';

const { Geolocation } = Plugins;

declare var H: any;

@Component({
    selector: 'here-map',
    templateUrl: './here-map.component.html',
    styleUrls: ['./here-map.component.scss']
})
export class HereMapComponent extends LatLonEllipsoidal{
  π: any = Math.PI;
  ε: Number = Number.EPSILON;
  @ViewChild("map")
  public mapElement: ElementRef;

  @Input()
  public appId: any;

  @Input()
  public appCode: any;

  @Input()
  public start: any;

  @Input()
  public width: any;

  @Input()
  public height: any;

  @Input()
  public finish: any;

  public directions: any;

  public platform: any;
  public map: any;
  public router: any;
  public coords: any;
  public routeLine: any;


  options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  public constructor(public http: HttpClient) {
    super();
  }

  smartBins: any = []
  public ngOnInit() {
    this.platform = new H.service.Platform({
      "app_id": this.appId,
      "app_code": this.appCode
    });
    this.directions = [];
    this.router = this.platform.getRoutingService();
  }

  
  public async ngAfterViewInit() {
    const coordinates = await Geolocation.getCurrentPosition(this.options);
    this.coords = coordinates.coords;
    console.log(this.coords);
    let defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(
        this.mapElement.nativeElement,
        defaultLayers.normal.map,
        {
            zoom: 20,
            center: { lat: this.coords.latitude, lng: this.coords.longitude }
        }
    );
    let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    var ui = H.ui.UI.createDefault(this.map, defaultLayers);
    var myMarker = new H.map.Marker(new H.geo.Point(this.coords.latitude,this.coords.longitude),{icon: new H.map.Icon('/assets/rajDesign/images/location (1).png')});
    myMarker.setData("You Are Here");
    this.map.addObject(myMarker);
    //console.log(this.accType)
    var group = new H.map.Group();
    this.map.addObject(group);

    group.addEventListener('tap', function (evt) {
      var bubble =  new H.ui.InfoBubble(evt.target.getGeometry(), {
        // read custom data
        content: evt.target.getData()
      });
      // show info bubble
      ui.addBubble(bubble);
    }, false);
    group.addObject(myMarker);
    var url = 'https://weecycle-db.herokuapp.com/getSmartBins';
    this.http.get(url).subscribe(data => {
      //var tmpsmartBins: any = [];
      //this.smartBins = data
      console.log(data);
      for(var i = 0; i < Object.keys(data).length; i++){       
        var dLatLng = data[i].sLatsLng.split(",");
        
        var dName = data[i].sName;
        var dPoints = {lat: parseFloat(dLatLng[0]), lon: parseFloat(dLatLng[1])};
        var dist = this.distanceTo(dPoints);        
        if(dist < 500){
          var binMarker = new H.map.Marker(new H.geo.Point(dLatLng[0],dLatLng[1]),{icon: new H.map.Icon('/assets/rajDesign/images/smartBins.png')});
          binMarker.setData(dName);
          this.map.addObject(binMarker);
          group.addObject(binMarker);
        }    
        
      }
    })


    // var myMarker1 = new H.map.Marker({ lat: '1.3817', lng: '103.8449' });
    // myMarker1.setData("Bin A");
    // var myMarker2 = new H.map.Marker({ lat: '1.3823', lng: '103.8459' });
    // myMarker2.setData("Bin B");
    // var myMarker3 = new H.map.Marker({ lat: '1.3777', lng: '103.8487' });
    // myMarker3.setData("Bin C");
    // console.log(myMarker3);
    // this.map.addObject(myMarker1);
    // this.map.addObject(myMarker2);
    // this.map.addObject(myMarker3);

    // group.addObject(myMarker1);
    // group.addObject(myMarker2);
    // group.addObject(myMarker3);
  }

  
  public ngOnChanges(changes: SimpleChanges) {
    if((changes["finish"] && !changes["finish"].isFirstChange())) {
      this.route(this.finish);
    }
  }


  // public findBins() {
  //   var myMarker = new H.map.Marker({ lat: '1.3809', lng: '103.8466' });
  //   // this.route("1.3800,103.8489", "1.3817,103.8449")
  //   myMarker.addEventListener('pointerenter', this.test());
    
  //   // var myMarker2 = new H.map.Marker({ lat: '1.379', lng: '103.845' });;
  //   // myMarker2.addEventListener('pointerenter', this.route("1.3800,103.8489", "1.379,103.845"));

  //   // var myMarker3 = new H.map.Marker({ lat: '1.381', lng: '103.841' });
  //   // myMarker3.addEventListener('pointerenter', this.route("1.3800,103.8489", "1.381,103.841"));

  //   this.map.addObject(myMarker);
  //   this.map.addObject(myMarker2);
  //   this.map.addObject(myMarker3);
  // }
  // public eventListeners() {
  //   myMarker3.addEventListener('pointerenter', this.route("1.3800,103.8489", "1.381,103.841"));
  //   myMarker2.addEventListener('pointerenter', this.route("1.3800,103.8489", "1.379,103.845"));
  // }

  public route(finish: any) {
    let params = {
        "mode": "fastest;pedestrian",
        "waypoint0": "geo!" + this.coords.latitude +","+this.coords.longitude,
        "waypoint1": "geo!" + this.finish,
        "representation": "display"
    }
    //this.map.removeObjects(this.map.getObjects());    
    this.router.calculateRoute(params, data => {
        if(data.response) {
            this.directions = data.response.route[0].leg[0].maneuver;
            data = data.response.route[0];
            let lineString = new H.geo.LineString();
            data.shape.forEach(point => {
                let parts = point.split(",");
                lineString.pushLatLngAlt(parts[0], parts[1]);
            });
            this.routeLine = new H.map.Polyline(lineString, {
                style: { strokeColor: "blue", lineWidth: 5 }
            });
          
            this.routeLine.id = "route";
            var group = new H.map.Group();
            group.id = "route";
            for(let objects of this.map.getObjects()){
              if (objects.id === "route") {
                this.map.removeObject(objects)
              }
            }
            this.map.addObject(this.routeLine);
            this.map.setViewBounds(this.routeLine.getBounds());
        }
    }, error => {
        console.error(error);
    });
}
      
  //InfoBubble
  public bubble: any;
  public openBubble(position: string[], text: string) {
    var ui = H.ui.UI.createDefault(this.map, this.platform.defaultLayers);
    if (!this.bubble) {
      this.bubble = new H.ui.InfoBubble(
        position,
        { content: text });
      ui.addBubble(this.bubble);
    } else {
      this.bubble.setPosition(position);
      this.bubble.setContent(text);
      this.bubble.open();
    }
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