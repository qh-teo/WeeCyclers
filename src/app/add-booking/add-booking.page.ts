import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import emailjs from 'emailjs-com';
import { UserlocationComponent } from '../userlocation/userlocation.component'; //add for ioncomponent


@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.page.html',
  styleUrls: ['./add-booking.page.scss'],
})
export class AddBookingPage implements OnInit {
  currentDate: string;
  // futureYear : string;
  //
  public minDate = moment().add(3,'days').format();
  public maxDate = moment().add(5,'y').format();

  redirectTo(url:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([url]));
 }

  myDate: String = new Date().toISOString();
  minTime = '10:30';
  maxTime = '19:30';
  hourValues = ['06','07','08','09','10','11','12','13','14','15','16','17','18','19'];
  minuteValues = ['00','15','30','45']
  addBookingForm: FormGroup;

  // For validation:
  submitted: boolean = false;

  static validatePostal(fc:  FormControl){
  let re = /(\d{6})$/ // regex 
    if (re.test(fc.value)==false){
      // var match = re.exec(fc.value);
      return({validatePostal: true});
    } else {
      return null;
    }
  }

  constructor(public http: HttpClient, private router: Router,  private toastController: ToastController) {
    this.addBookingForm = new FormGroup({
      address: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [AddBookingPage.validatePostal]),
      bookingDate: new FormControl('', [Validators.required]),
      bookingTime: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required])
    })
   }
  
  ngOnInit() {
  }

  async successfulToast(){
    const toast = await this.toastController.create({
      message: 'Booking has been made.',
      duration: 2000,
      position: 'top',
      color: 'secondary'
      });
      toast.present();
  } 

  add(){
    this.submitted = true;

    if (this.addBookingForm.valid){
      var empeId = 1; //to change to promise
      var email = this.addBookingForm.value.email;
      var bookingaddress = this.addBookingForm.value['address'];
      var postalcode = this.addBookingForm.value['postalCode']; 
      var dateFormat = this.addBookingForm.value.bookingDate;
      var timeFormat = this.addBookingForm.value.bookingTime;
      var dateFormatted = dateFormat.split('T')[0];
      var timeFormatted;
      timeFormatted = timeFormat.substring((timeFormat.split('T')[0].length)),timeFormat.length;
      timeFormatted = timeFormatted.substring(1,6);

      var templateParams = {
        name: "James",
        user_email: email,
        bookingaddress: bookingaddress,
        postalcode: postalcode,
        date: dateFormatted,
        time: timeFormatted
      }
      // add in the service id, template id and user id from emailjs accordingly 
      emailjs.send('<service_id>', '<template_id>', templateParams, '<user_id>')
      .then(function(response){

        console.log('SUCCESS!', response.status, response.text, templateParams);
     }, function(error) {
        console.log('FAILED...', error);
     });

      // var url = 'https://weecycle-db.herokuapp.com/addBooking';
      var url = 'https://skippyq4.herokuapp.com/addBooking';
    
      //preparing json variables
      var postData = JSON.stringify({
        collectionDate: dateFormatted + " " +timeFormatted,
        collectionAddress: bookingaddress, //to look into adding postal code or adding a seperate field for it
        collectionPts: 10,
        collectionSTS: false,
        collectionCollector: 'Amy',
        collectionPostalCode: postalcode,
        email: email,
        empe_id: empeId,
        collectionLatLong: '1.375433725884075,103.84890964989688'
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
        // console.log(postData);
        // console.log(data);
      
        // console.log(data["insertId"])
        if (data!=''){
          //this.successful()
          // window.location.reload();
          this.successfulToast()     
          this.redirectTo('tabs/tab2');
        }
      }, error=>{
        console.log(error);
      });
        

        // this.router.navigate(['tabs/tab2']);     
      }
    }
}
