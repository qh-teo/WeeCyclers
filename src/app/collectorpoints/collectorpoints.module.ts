import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CollectorpointsPageRoutingModule } from './collectorpoints-routing.module';

import { CollectorpointsPage } from './collectorpoints.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectorpointsPageRoutingModule
  ],
  declarations: [CollectorpointsPage]
})
export class CollectorpointsPageModule {}
