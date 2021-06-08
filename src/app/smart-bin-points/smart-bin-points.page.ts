import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-smart-bin-points',
  templateUrl: './smart-bin-points.page.html',
  styleUrls: ['./smart-bin-points.page.scss'],
})
export class SmartBinPointsPage implements OnInit {
  points: number;
  constructor(
    private route: ActivatedRoute
    ,private router: Router
    ,public http: HttpClient
    ,public navCtrl: NavController
    ,public alertController: AlertController,
    ) { }


  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   if (params && params.special && params.result && params.feature ) {
    //     this.image = JSON.parse(params.special);
    //     this.result = JSON.parse(params.result);
    //     this.feature = JSON.parse(params.feature);
    //   }
    //   switch(this.feature.value){
    //     case "OBJECT_LOCALIZATION":{
    //       this.result = this.result.responses[0].localizedObjectAnnotations
    //       break;
    //     }
    //     default:{
    //       this.result = this.result.responses[0].labelAnnotations
    //       }
    //   }
    //   console.log(this.result)
    // });
  }

  addPoints(){
    var url = 'https://weecycle-db.herokuapp.com/addPoints';
    
    //preparing json variables
    var postData = JSON.stringify({
      points: 50,
      amtR: 10

    });
    //informing system that string submitted in http req is json
    const httpOptions ={
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      })
    }
    
    this.http.post(url, postData, httpOptions).subscribe((data)=>{
      console.log(postData);
      console.log(data);
      
      // if(data == false){
      //   //this.failed()
      // } else 
      if (data){
        //this.successful()
        // window.location.reload();
        this.presentSuccAlert("Congratulations you earned +50 points!")
        
        
      }
    }, error=>{
      console.log(error);
    });

    // this.router.navigate(['tabs/tab2']);     
  }

  async presentSuccAlert(message) {
    const alert = await this.alertController.create({
      header: 'Success',
      message,
      buttons: [{
        text: 'Ok',
        role: 'ok',
        handler: () =>{
          this.goHome();
        }
      }]
    });
    await alert.present();
  }

  goHome(){
    this.navCtrl.navigateForward('');
  }

}
