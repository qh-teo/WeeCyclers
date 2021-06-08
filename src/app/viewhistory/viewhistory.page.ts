import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-viewhistory',
  templateUrl: './viewhistory.page.html',
  styleUrls: ['./viewhistory.page.scss'],
})
export class ViewhistoryPage implements OnInit {

  constructor(public http: HttpClient) { }
  booking: any = [];

  ionViewDidEnter (){
    // this.ngOnInit();
    this.getHistory();
  }

  ngOnInit() {
  }

  async getHistory(){
    var url = 'https://skippyq4.herokuapp.com/getBookingHistory';
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
      this.booking=data;
      // for (const items in data){
      //   console.log(data[items]["collectionaddress"])
      // }
      // console.log('hello' + products[0])
      console.log(data)
      // window.location.reload();
      
      // console.log(this.products);
    }, error=>{
      console.log(error);
    });
  }

}
