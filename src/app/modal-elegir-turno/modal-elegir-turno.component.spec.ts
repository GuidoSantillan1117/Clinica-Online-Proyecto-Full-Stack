import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalElegirTurnoComponent } from './modal-elegir-turno.component';

describe('ModalElegirTurnoComponent', () => {
  let component: ModalElegirTurnoComponent;
  let fixture: ComponentFixture<ModalElegirTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalElegirTurnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalElegirTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
