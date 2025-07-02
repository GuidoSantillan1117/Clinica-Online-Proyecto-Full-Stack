import { Component, OnDestroy, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { User } from '../../clases/User';
import { TurnoInfoService } from '../../turno-info.service';
import { ModalElegirTurnoComponent } from '../../modal-elegir-turno/modal-elegir-turno.component';
import { PipeGeneroPipe } from '../../../pipeGenero.pipe';
import { BordeDirective } from '../../../borde.directive';

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule, FormsModule, RouterModule,ModalElegirTurnoComponent,PipeGeneroPipe,BordeDirective],
  standalone: true,
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {

  especialistas = signal<any[]>([]);
  usuario: User | null = null;
  turnoAbierto: boolean = false

  id_paciente : number = 0;
  private usuarioSub!: Subscription;
  private turnoAbiertoSub!:Subscription

  informacionEspecialistaSeleccionado : any;

  constructor(private dbService: DatabaseService, private authService: AuthService, private turnoInfoService:TurnoInfoService) {
    this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
        this.traerEspecialistas();
        this.traerIdPaciente(user.id)
      }
    });
  }

  ngOnInit(){
    this.turnoAbiertoSub = this.turnoInfoService.elegirTurnoAbierto$.subscribe(abierto=>{
      this.turnoAbierto = abierto
    })
  }

  async traerIdPaciente(id:string)
  {
    const {data} = await this.dbService.traerIdPaciente(id)
    if(data)
    {
      this.id_paciente = data.id_paciente
    }
    
  }
  async traerEspecialistas()
  {
    const {data,error} = await this.dbService.traerDatosEspecialistas()
    console.log(data);
    if(!error)
    {
      this.especialistas.set(data!)
    }
  }

  seleccionarEspecialista(especialista:any)
  {
    console.log(this.usuario?.rol)
    let listaEspecialidades = [especialista.especialidad_1,especialista.especialidad_2,especialista.especialidad_3,especialista.especialidad_4]
    listaEspecialidades = listaEspecialidades.filter(especialidad=>especialidad!==null)


    const infoEspecialista = {especialidades:listaEspecialidades,
                              id:especialista.id,
                              id_especialista:especialista.id_especialista,
                              id_paciente:this.id_paciente,
                              rol: this.usuario!.rol
        
                              }

    this.informacionEspecialistaSeleccionado = infoEspecialista
    this.turnoInfoService.abrirTurno();
  }
}
