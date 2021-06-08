import { getLocaleTimeFormat } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import emailjs from 'emailjs-com';


@Component({
  selector: 'app-edit-booking',
  templateUrl: './edit-booking.page.html',
  styleUrls: ['./edit-booking.page.scss'],
})
export class EditBookingPage implements OnInit {
  bookingId: number;
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
  
  public collectionTime;

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
  editBookingForm: FormGroup;

  constructor(public http: HttpClient,private route: ActivatedRoute, private router: Router,private toastController: ToastController, private cdr: ChangeDetectorRef) { 
    this.bookingId = this.route.snapshot.params.id;

    this.editBookingForm = new FormGroup({
      address: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [EditBookingPage.validatePostal]),
      bookingDate: new FormControl('', [Validators.required]),
      bookingTime: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required])    
    });
    
  };

  ngOnInit() {
    this.getData();
  }

  toTimeZone(time, zone) {
    var format = 'HH:mm';
    return moment(time, format).tz(zone).format(format);
  }

  result: any = [];
  getData(){
    var url = 'https://skippyq4.herokuapp.com/getBooking';
    var empeid = 1;
    var postData = JSON.stringify({
        empe_id: empeid,
        collection_id: this.bookingId
      });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      })
    };

    this.http.post(url, postData, httpOptions).subscribe((data) => {
      console.log('postData:', postData)
      console.log(data);
      
      if (data != null) {
        this.result = data;
        var timeFormat= data[0]["collectiondate"];
        var timeFormatted;
        timeFormatted = timeFormat.substring((timeFormat.split('T')[0].length)),timeFormat.length;
        timeFormatted = timeFormatted.substring(1,6);
        // console.log(this.toTimeZone(bookingDate,"Asia/Singapore"));
 
        this.editBookingForm.patchValue({
          bookingTime:  timeFormatted,//this.toTimeZone(bookingDate,"Asia/Singapore"),
        });
        
        this.cdr.detectChanges();

      } else {}
    }, error => {
      console.log(error);
    });
 
  }

 

  async successfulToast(){
    const toast = await this.toastController.create({
      message: 'Booking has been updated.',
      duration: 2000,
      position: 'top',
      color: 'secondary'
      });
      toast.present();
  } 

  update(){
    this.submitted = true;

    var url = 'https://skippyq4.herokuapp.com/updateBooking';
    
    if (this.editBookingForm.valid){
      var empeId = 1; //to change to promise
      var email = this.editBookingForm.value.email;
      var bookingaddress = this.editBookingForm.value['address'];
      var postalcode = this.editBookingForm.value['postalCode']; 
      var dateFormat = this.editBookingForm.value.bookingDate;
      var timeFormat = this.editBookingForm.value.bookingTime;
      var dateFormatted = dateFormat.split('T')[0];
      var timeFormatted;
      timeFormatted = timeFormat.substring((timeFormat.split('T')[0].length)),timeFormat.length;


      var templateParams = {
        name: "James",
        user_email: email,
        bookingaddress: bookingaddress,
        postalcode: postalcode,
        date: dateFormatted,
        time: timeFormat
      }

     // add in the service id, template id and user id from emailjs accordingly 
     emailjs.send('<service_id>', '<template_id>', templateParams, '<user_id>')
      .then(function(response){

        console.log('SUCCESS!', response.status, response.text, templateParams);
     }, function(error) {
        console.log('FAILED...', error);
     });
      
      //preparing json variables
      var postData = JSON.stringify({
        collectionDate: dateFormatted + " " + timeFormat,
        collectionid: this.bookingId,
        collectionAddress: this.editBookingForm.value['address'],
        collectionPostalCode: this.editBookingForm.value['postalCode'],
        email: email,
        empe_id: empeId
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

          if (data!=''){
            this.successfulToast();
            this.redirectTo('tabs/tab2');
          }
        }, error=>{
          console.log(error);
        });
       
    }
  }

}
