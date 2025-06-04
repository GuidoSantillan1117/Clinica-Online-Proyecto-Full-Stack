import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValoracionDialogComponent } from './valoracion-dialog.component';

describe('ValoracionDialogComponent', () => {
  let component: ValoracionDialogComponent;
  let fixture: ComponentFixture<ValoracionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoracionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValoracionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
