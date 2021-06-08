import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddBookingPage } from './add-booking.page';

describe('AddBookingPage', () => {
  let component: AddBookingPage;
  let fixture: ComponentFixture<AddBookingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBookingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddBookingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
