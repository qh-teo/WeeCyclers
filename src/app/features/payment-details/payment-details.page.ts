import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
declare var paypal: any;

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.page.html',
  styleUrls: ['./payment-details.page.scss'],
})
export class PaymentDetailsPage implements OnInit {

  paySubForm: FormGroup;
  curr: any;
  profileId: any;
  result: any = [];
  pageStat: any;

  constructor(
    public http: HttpClient,
    private route: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private router: Router,
    public loadingController: LoadingController) {

    this.profileId = this.route.snapshot.params.id;
    this.curr = this.getCurrency(10);

    this.paySubForm = new FormGroup({
      uName: new FormControl(''),
      uEmail: new FormControl(''),
      uAddress: new FormControl(''),
      uMemberRole: new FormControl(''),
      pName: new FormControl('WeeCycle Premium'),
      pCycle: new FormControl('Monthly'),
      pPrice: new FormControl(this.curr)
      // pName: new FormControl(''),
      // pCycle: new FormControl(''),
      // pPrice: new FormControl(0)
    });

  }

  // Show currency
  getCurrency(amount: number) {
    return this.currencyPipe.transform(amount, '$ ', true);
  }

  ngOnInit() {
    this.getData()
    // this.getProdData()    
    // console.log(Object.assign({}, ...this.result));
  }

  // Show data method
  async getData() {

    const loading = await this.loadingController.create({      
      message: 'Retriving details',
      spinner: 'dots'
    });
    loading.present();
    
    let url = 'https://weecycle-db.herokuapp.com/getUserData';
    let postData = JSON.stringify({
      ProfileID: this.profileId,
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
        loading.dismiss();
      } else {
        // this.failed()
      }
    }, error => {
      console.log(error);
    });
  }

  getProdData() {
    let url = 'https://weecycle-db.herokuapp.com/getProdData';
    let postData = JSON.stringify({
      PriceID: 1,
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
      } else {
        // this.failed()
      }
    }, error => {
      console.log(error);
    });
  }

  // Paypal payment gateway
  async makePaypalOrder() {

    let renderArea = document.querySelector('#paypal-button-container');
    const loading = await this.loadingController.create({            
      spinner: 'dots',
      duration: 3000
    });
    if (renderArea.childNodes.length === 0) {            

      let box = {
        paySubForm: this.paySubForm,
        cost: this.paySubForm.value['pPrice'].replace('$ ', ""),
        func: this.updateUserStat,
        http: this.http,
        router: this.router,
        id: this.profileId,
        load: loading
      }

      paypal.Buttons({
        style: {
          layout: 'horizontal'
        },
        createOrder: function (data, actions) {
          // This function sets up the details of the transaction, including the amount and line item details.     
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "SGD",
                value: box.cost,
              }
            }]
          });
        },
        onApprove: (data, actions) => {
          // This function captures the funds from the transaction.
          return actions.order.capture().then((details) => {       
            box.load.message = "Payment Successful!\nRedirecting to home";     
            box.load.present();            
            box.func(box);
            // This function shows a transaction success message to your buyer.
            // alert('Transaction completed by ' + details.payer.name.given_name);
          });
        }
      }).render('#paypal-button-container');
    }
  }

  // Update user data and insert payment transaction method
  updateUserStat(box) {

    let url = 'https://weecycle-db.herokuapp.com/updateUserData';
    let memberType = box.paySubForm.value['uMemberRole'] === 'Non-Member' ? 'Member' : 'Non-Member';
    let postData = JSON.stringify({
      ProfileId: box.id,
      ProfileRole: memberType,
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      })
    };

    box.http.post(url, postData, httpOptions).subscribe((data) => {
      // console.log(postData)
      // console.log(data);
      if (data == true) {
        this.result = data; 
        box.load.dismiss();       
        window.location.reload();
      } else {
        // this.failed()
      }
    }, error => {
      // console.log(error);
    });
        
    box.router.navigate(['tabs/tab1']);  
    
    
  }

  // Unsubscribe from Paypal
  async unsubPaypal() {

    const loading = await this.loadingController.create({            
      message: 'Successfully Unsubscribe',
      spinner: 'dots',
      duration: 3000
    });
    let box = {
      paySubForm: this.paySubForm,
      func: this.updateUserStat,
      http: this.http,
      router: this.router,
      id: this.profileId,
      load: loading
    }

    box.load.present();   
    box.func(box);

  }
}
