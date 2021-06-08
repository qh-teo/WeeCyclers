import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
// import { DeleteModalPage } from '../delete-modal/delete-modal.page';


// import { Calendar }
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  constructor(public http: HttpClient, private router: Router,
    private modalController: ModalController,
    public alertController: AlertController,private toastController: ToastController, private navController: NavController) {}
  products: any = [];
  
  redirectTo(url:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([url]));
 }

//  async present1Alert() {
//   const modal = await this.modalController.create({
//   component: DeleteModalPage
//   });
//   return await modal.present();
//   }
 result:string;
 async presentAlert(data:string) {
  console.log(data);
  this.result = data;
  
   //buttons: ['OK', 'Cancel']
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Delete Record?',
    message: 'Would you like to delete your record. This is irreversable',
    
    buttons: [
      {
        text: 'No',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Yes',
        handler: data => {
          console.log('Confirm Ok', this.result);
          this.clearDB(this.result);
          this.result='';
          // result=true;
        }
      }
    ]
  });

  await alert.present();
}

  toTimeZone(time, zone) {
    var format = 'HH:mm';
    return moment(time, format).tz(zone).format(format);
  }
  

  ionViewDidEnter (){
    // this.ngOnInit();
    this.getBookings();

  }
  
  addCalendar(){

  }

  ngOnInit(){
  }


  async getBookings(){
    var url = 'https://skippyq4.herokuapp.com/getBookingDetails';
    var empe_id =1;
    var postData = JSON.stringify({
      empe_id: empe_id 
    });

    const httpOptions ={
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      })
    }
  
    this.http.post(url, postData, httpOptions).subscribe(data => {
      // console.log(postData);
      this.products=data;
      for (const items in data){
        console.log(data[items]["collectionaddress"])
      }
      // console.log('hello' + products[0])
      console.log(data)
      // window.location.reload();
      
      // console.log(this.products);
    }, error=>{
      console.log(error);
    });
  }

  async successfulToast(){
    const toast = await this.toastController.create({
      message: 'Booking has been deleted.',
      duration: 2000,
      position: 'top',
      color: 'secondary'
      });
      toast.present();
  } 


  delete(item){
    var collectionid=item;
    // console.log(item);
    var result = this.presentAlert(collectionid);

    this.clearDB(result);
  }

  clearDB(val){
    var url = 'https://skippyq4.herokuapp.com/deleteBooking';
    
    //preparing json variables
    var postData = JSON.stringify({
      collectionid:val,
      empe_id: 1
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
      // console.log('postData:',postData);
      console.log(postData);
      console.log(data);
      
      if (data!=""){
        this.successfulToast();
        this.redirectTo('tabs/tab2');
      }
    }, error=>{
      console.log(error);
    });

  }

}
