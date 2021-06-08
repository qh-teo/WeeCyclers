import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CollectorPage } from './collector.page';

describe('CollectorPage', () => {
  let component: CollectorPage;
  let fixture: ComponentFixture<CollectorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
