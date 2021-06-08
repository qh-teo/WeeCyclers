import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SmartBinPointsPageRoutingModule } from './smart-bin-points-routing.module';

import { SmartBinPointsPage } from './smart-bin-points.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SmartBinPointsPageRoutingModule
  ],
  declarations: [SmartBinPointsPage]
})
export class SmartBinPointsPageModule {}
