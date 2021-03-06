import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlagUnflagConfirmationComponent } from './flag-unflag-confirmation.component';

describe('FlagUnflagConfirmationComponent', () => {
  let component: FlagUnflagConfirmationComponent;
  let fixture: ComponentFixture<FlagUnflagConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagUnflagConfirmationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlagUnflagConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
