import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewhistoryPageRoutingModule } from './viewhistory-routing.module';

import { ViewhistoryPage } from './viewhistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewhistoryPageRoutingModule
  ],
  declarations: [ViewhistoryPage]
})
export class ViewhistoryPageModule {}
