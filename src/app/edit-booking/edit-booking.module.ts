import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBookingPageRoutingModule } from './edit-booking-routing.module';

import { EditBookingPage } from './edit-booking.page';
import { UserlocationComponent } from '../userlocation/userlocation.component'; //add for ioncomponent


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditBookingPageRoutingModule
  ],
  declarations: [EditBookingPage, UserlocationComponent],
  exports: [UserlocationComponent]
})
export class EditBookingPageModule {}
