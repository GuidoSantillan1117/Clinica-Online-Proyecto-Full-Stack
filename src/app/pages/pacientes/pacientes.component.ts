import { Component ,signal} from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../clases/User';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalHistorialComponent } from '../modal-historial/modal-historial.component';


@Component({
  selector: 'app-pacientes',
  imports: [FormsModule,CommonModule,ModalHistorialComponent],
  standalone:true,
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent {

  pacientes = signal<any[]>([]);
  usuario: User | null = null;
  idPaciente : number | null = null;
  mostrarHistorial = false;

  historial:any;
  private usuarioSub!: Subscription;
  constructor(private dbService: DatabaseService, private authService: AuthService) {

    this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
        this.traerAtendidos();

      }
    });
  }

  async traerAtendidos()
  {
    const atendidos : string [] =  [];
    const pacientes = [];
    const {data,error} = await this.dbService.cargarPacientesAtendidos(true,this.usuario?.id!)

    for(let paciente of data!)
    {
      if(!atendidos.includes(paciente.id_paciente))
      {
        atendidos.push(paciente.id_paciente)
        pacientes.push(paciente);
      }
    }

    console.log(pacientes);
    this.pacientes.set(pacientes)

  }

  async abrirHistorial(paciente:any)
  {
    const {data} = await this.dbService.cargarHistorialClinicoPacienteEspecialista(true,paciente.id_paciente,this.usuario?.id!)
    this.historial = data;
    this.mostrarHistorial = true;

    console.log(data)
  }
}
