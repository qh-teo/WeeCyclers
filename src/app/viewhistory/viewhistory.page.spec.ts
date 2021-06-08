import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewhistoryPage } from './viewhistory.page';

describe('ViewhistoryPage', () => {
  let component: ViewhistoryPage;
  let fixture: ComponentFixture<ViewhistoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewhistoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewhistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
