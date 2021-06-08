import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddBookingPageRoutingModule } from './add-booking-routing.module';

import { AddBookingPage } from './add-booking.page';
import { UserlocationComponent } from '../userlocation/userlocation.component'; //add for ioncomponent


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddBookingPageRoutingModule
  ],
  declarations: [AddBookingPage, UserlocationComponent],
  exports: [UserlocationComponent]
})
export class AddBookingPageModule {}
