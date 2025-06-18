import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPdfComponent } from './modal-pdf.component';

describe('ModalPdfComponent', () => {
  let component: ModalPdfComponent;
  let fixture: ComponentFixture<ModalPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
