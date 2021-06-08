import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewhistoryPage } from './viewhistory.page';

const routes: Routes = [
  {
    path: '',
    component: ViewhistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewhistoryPageRoutingModule {}
