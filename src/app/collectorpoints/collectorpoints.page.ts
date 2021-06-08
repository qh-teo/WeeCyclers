import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-collectorpoints',
  templateUrl: './collectorpoints.page.html',
  styleUrls: ['./collectorpoints.page.scss'],
})
export class CollectorpointsPage implements OnInit {

  constructor(
    private route: ActivatedRoute
    ,private router: Router
    ,public http: HttpClient
    ,public navCtrl: NavController
    ,public alertController: AlertController
    ) { }

  ngOnInit() {
  }

  clearBin(){
    var url = 'https://weecycle-db.herokuapp.com/clearBin';
    
    //preparing json variables
    var postData = JSON.stringify({
      points: 200
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
        this.presentSuccAlert("Congratulations you earned +200 points!")
        
        
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
    this.navCtrl.navigateForward('collector');
  }

}
