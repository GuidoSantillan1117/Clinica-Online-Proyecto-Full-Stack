import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticoDialogComponent } from './diagnostico-dialog.component';

describe('DiagnosticoDialogComponent', () => {
  let component: DiagnosticoDialogComponent;
  let fixture: ComponentFixture<DiagnosticoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
