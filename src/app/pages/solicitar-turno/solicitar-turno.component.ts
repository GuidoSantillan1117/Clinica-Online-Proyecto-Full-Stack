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

    imagenesEspecialidades = [{nombre:'kinesiologo',imagen:'/kinesiologo.jpg'},
  {nombre:'dentista',imagen:'/dentista.jpg'},
  {nombre:'ostetra',imagen:'/ostetra.jpg'},
  {nombre:'pediatra',imagen:'/dentista.jpg'},
]
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
    let listaEspecialidades = [{nombre: especialista.especialidad_1,imagen:''},{nombre: especialista.especialidad_2,imagen:''},
      {nombre:especialista.especialidad_3,imagen:''},{nombre: especialista.especialidad_4,imagen:''}]
    listaEspecialidades = listaEspecialidades.filter(especialidad=>especialidad.nombre!==null)
    this.agregarImagen(listaEspecialidades);


    const infoEspecialista = {especialidades:listaEspecialidades,
                              id:especialista.id,
                              id_especialista:especialista.id_especialista,
                              id_paciente:this.id_paciente,
                              rol: this.usuario!.rol
        
                              }

    this.informacionEspecialistaSeleccionado = infoEspecialista
    this.turnoInfoService.abrirTurno();
  }


    agregarImagen(especialidades:any[])
  {
    for (let especialidad of especialidades)
    {
      const especialidadEncontrada = this.imagenesEspecialidades.find(e => e.nombre === especialidad.nombre.toLocaleLowerCase());
      if(especialidadEncontrada)
      {
        especialidad.imagen = especialidadEncontrada.imagen;
      }
      else{
        especialidad.imagen = '/white.png'; 
      }
    }
  }
  
}
