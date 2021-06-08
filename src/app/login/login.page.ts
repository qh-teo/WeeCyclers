import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  data: Observable<any>;
  accType: string = '';

  constructor(    
    public navCtrl: NavController,
    private toastController: ToastController,
    public http: HttpClient
    ) {
      this.loginForm = new FormGroup({
        username: new FormControl(''),
        password: new FormControl(''),
      })
     }

  ngOnInit() {
  }

  async successfulToast(){
    const toast = await this.toastController.create({
      message: 'Welcome!.',
      duration: 2000,
      position: 'top',
      color: 'Success'
      });
      toast.present();
  } 
  async failedToast(){
    const toast = await this.toastController.create({
      message: 'Invalid Username/Password.',
      duration: 2000,
      position: 'top',
      color: 'danger'
      });
      toast.present();
  } 

  async failedToastAccT(){
    const toast = await this.toastController.create({
      message: 'Select an Account Type',
      duration: 2000,
      position: 'top',
      color: 'danger'
      });
      toast.present();
  }
  login(){
    var username = this.loginForm.value['username'];
    var password = this.loginForm.value['password'];
    var url = 'https://weecycle-db.herokuapp.com/signup';
    
    var postData = JSON.stringify({
      username: username,
      password: password
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
      if(!this.accType){
        this.failedToastAccT();
      }
      else if (this.accType="WeeCycler") {     
        this.navCtrl.navigateForward('');
      }
      else if (this.accType="Collector") {     
        this.navCtrl.navigateForward('collector');
      }
      else { 
        this.failedToast();
      }

    }, error=>{
      console.log("Im here2");
      console.log(error);
      console.log(this.data);

    });
  }

  loginRaj(){
    console.log(this.accType);
    if(!this.accType){
      this.failedToastAccT();
    }
    else if (this.loginForm.value.username == "James" && this.loginForm.value.password != "") {     
      this.navCtrl.navigateForward('');
    }
    else if (this.loginForm.value.username == "Amy" && this.loginForm.value.password != "") {     
      this.navCtrl.navigateForward('collector');
    }
    else { 
      this.failedToast();
    }


    
  }

  accCollector(){
    this.accType = "Collector"
  }

  accWeeCycler(){
    this.accType = "WeeCycler"
  }

}
