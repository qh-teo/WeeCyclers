import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CollectorpointsPage } from './collectorpoints.page';

describe('CollectorpointsPage', () => {
  let component: CollectorpointsPage;
  let fixture: ComponentFixture<CollectorpointsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectorpointsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectorpointsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
