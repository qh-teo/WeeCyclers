import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { CollectormapComponent } from '../collectormap/collectormap.component';

import { CollectorPageRoutingModule } from './collector-routing.module';

import { CollectorPage } from './collector.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    CollectorPageRoutingModule
  ],
  declarations: [CollectorPage, CollectormapComponent],
  exports: [CollectormapComponent]
})
export class CollectorPageModule {}
