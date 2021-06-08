import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  signupForm : FormGroup;
  data: Observable<any>;
  constructor(public http: HttpClient) {
    this.signupForm = new FormGroup({
      username : new FormControl(),
      password: new FormControl()
    });
   }

  ngOnInit() {
  }
  signup(){
    var username = this.signupForm.value['username'];
    var password = this.signupForm.value['password'];
    var url = 'https://weecycle-db.herokuapp.com/signup';
    
    var postData = JSON.stringify({
      username: username,
      password: password,
    });
    console.log(username+" "+password)
    console.log('postData:',postData);
    const httpOptions ={
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      })
    }
    this.http.post(url, postData, httpOptions).subscribe((data)=>{
      console.log("Im here");
      console.log(data);

    }, error=>{
      console.log("Im here2");
      console.log(error);
      console.log(this.data);

    });
  }
}
