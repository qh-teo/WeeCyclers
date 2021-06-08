import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmartBinPointsPage } from './smart-bin-points.page';

const routes: Routes = [
  {
    path: '',
    component: SmartBinPointsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmartBinPointsPageRoutingModule {}
