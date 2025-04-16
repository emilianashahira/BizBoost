import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOwnerDashboardComponent } from './business-owner-dashboard.component';

describe('BusinessOwnerDashboardComponent', () => {
  let component: BusinessOwnerDashboardComponent;
  let fixture: ComponentFixture<BusinessOwnerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessOwnerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessOwnerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
