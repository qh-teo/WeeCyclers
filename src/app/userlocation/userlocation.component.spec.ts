import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserlocationComponent } from './userlocation.component';

describe('UserlocationComponent', () => {
  let component: UserlocationComponent;
  let fixture: ComponentFixture<UserlocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserlocationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserlocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
