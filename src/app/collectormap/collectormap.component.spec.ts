import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CollectormapComponent } from './collectormap.component';

describe('CollectormapComponent', () => {
  let component: CollectormapComponent;
  let fixture: ComponentFixture<CollectormapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectormapComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectormapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
