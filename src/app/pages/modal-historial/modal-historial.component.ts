import { CommonModule, } from '@angular/common';
import { Component ,Input,Output,EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-historial',
  imports: [CommonModule,FormsModule],
  standalone:true,
  templateUrl: './modal-historial.component.html',
  styleUrl: './modal-historial.component.css'
})
export class ModalHistorialComponent {
  @Input() historial:any;
  @Output() cerrar = new EventEmitter<void>();

  mostrarResena = false;
  resena : string = "";
  resenaSeleccionada : number | null = null

  abrirResena(turno:any)
  {
    this.mostrarResena = true;
    this.resena = turno.comentario_paciente
    this.resenaSeleccionada = turno.id_turno

  }

    cerrarModal() {
    this.cerrar.emit();
  }


}
