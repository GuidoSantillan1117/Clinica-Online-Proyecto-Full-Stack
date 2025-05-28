import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialidadDialogComponent } from './especialidad-dialog.component';

describe('EspecialidadDialogComponent', () => {
  let component: EspecialidadDialogComponent;
  let fixture: ComponentFixture<EspecialidadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspecialidadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
