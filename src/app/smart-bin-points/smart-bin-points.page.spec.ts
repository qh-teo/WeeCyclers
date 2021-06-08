import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SmartBinPointsPage } from './smart-bin-points.page';

describe('SmartBinPointsPage', () => {
  let component: SmartBinPointsPage;
  let fixture: ComponentFixture<SmartBinPointsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartBinPointsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartBinPointsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
