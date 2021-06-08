import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  profileId: number;
  data: Observable<any>;
  constructor(public http: HttpClient, private route: ActivatedRoute) {
    this.profileId = this.route.snapshot.params.id;
  }
  profiledetails : any = [];

  ngOnInit() {
    this.getProfile();
  }
  async getProfile(){
    console.log(this.profileId);
    var url = 'https://weecycle-db.herokuapp.com/getProfile';

    var postData = JSON.stringify({
      profileId: this.profileId
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
        this.profiledetails = data;
      }
    });
  }

}
