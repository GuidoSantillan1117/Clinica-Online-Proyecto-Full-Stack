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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Especialidad } from './Especialidad';
import { ModalPdfComponent } from '../modal-pdf/modal-pdf.component';
import { MatDialog } from '@angular/material/dialog';

import { Pipe } from '@angular/core';

import { DatePipe } from '@angular/common';
import { PdfService } from '../../services/pdf.service';


@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule, RouterModule,TitleCasePipe,MatFormFieldModule,MatInputModule,DatePipe],
  standalone: true,
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})

export class MiPerfilComponent {
  mostrarHistorial = false;
  idEspecialista : number | undefined;
  horaInicio : any;
  horaFinal : any;
  sinErrores = false;
  listaEspecialidadesUsuario : any = []
  historialUsuario : any = []
  usuario: User | null = null;
  private  usuarioSub! : Subscription;
  constructor(private dbService: DatabaseService, private authService: AuthService,private pdf:PdfService,private matDialog: MatDialog) {
    this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
      }
    });

    if(this.usuario!.rol === 'especialista')
    {
      console.log("entre")
      this.traerEspecialidades(this.usuario!.id);
    }
  }


  async cargarHistorial()
  {
    this.mostrarHistorial = !this.mostrarHistorial

    if(this.mostrarHistorial)
    {
      const {data,error} = await this.dbService.cargarHistorialClinicoPaciente(this.usuario!.id)
      if(!error)
      {
        this.historialUsuario = data
        console.log(this.historialUsuario)
      }

    }
  }

  descargarPdfHistorial()
  {
    this.pdf.crearPdf(this.historialUsuario)
  }

  descargarPdfFiltrado()
  {
    const comentarioDialog = this.matDialog.open(ModalPdfComponent, {
            disableClose: true,
            data:{
              id:this.usuario?.id
            }
          });
  }
  async traerEspecialidades(id:string)
  {
    const { data} = await this.dbService.cargarEspecialidades(id);
    let listaEspecialidades = [data!.especialidad_1,data!.especialidad_2,data!.especialidad_3,data!.especialidad_4]
    listaEspecialidades = listaEspecialidades.filter(especialidad=>especialidad!==null)

    this.idEspecialista = data?.id_especialista
    const {data:dataHorario,error:errorHorario} = await this.dbService.cargarHorarios(this.idEspecialista!)

    
    for(let i = 0; i<listaEspecialidades.length;i++)
    {
      let especialidad : any;
      if(dataHorario!?.length>0)
      {
        this.sinErrores = true
        const horaInicioFormateada = this.convertirAHorasMinutos(dataHorario![i].hora_inicio)
        const horaFinalFormateada = this.convertirAHorasMinutos(dataHorario![i].hora_final)
         especialidad = new Especialidad(listaEspecialidades[i],horaInicioFormateada,horaFinalFormateada,dataHorario![i].dia)
      }
      else{
        especialidad = new Especialidad(listaEspecialidades[i])
        especialidad.horarioSinAsignarSet(true)
      }

      this.listaEspecialidadesUsuario.push(especialidad);
    }
  }

  async subirHorario(especialidad:Especialidad)
  {
    const {data:dataHorario,error:errorHorario} = await this.dbService.cargarHorarios(this.idEspecialista!)
    if(dataHorario!.length>0){
      const inicioIngresado = this.convertirAFecha(especialidad.inicio!);
      const finalIngresado = this.convertirAFecha(especialidad.final!);
      for(let horario of dataHorario!)
      {
        const inicioFormateado = this.convertirAFecha(horario.hora_inicio);
        const finalFormateado = this.convertirAFecha(horario.hora_final);

        if(horario.dia === especialidad.dia.toLowerCase() && (!this.verificarDisponibilidad(inicioFormateado,finalFormateado,inicioIngresado)&&!this.verificarDisponibilidad(inicioFormateado,finalFormateado,finalIngresado) ))
        {
          console.log("Coinciden las fechas")
          especialidad.coincidenSet(true)
        }
        else{
           especialidad.coincidenSet(false)
        }
      }
    }

    if(!especialidad.coincide)
    {
      const {data,error} = await this.dbService.subirHorario(especialidad,this.idEspecialista!)
      if(!error)
      {
        especialidad.coincidenSet(false)
        especialidad.horarioSinAsignarSet(false)
      }
    }
  }

    convertirAHorasMinutos(tiempo:string)
    {
        const [horas,minutos,segundos] = tiempo.split(':');
        const horas_minutos = `${horas}:${minutos}`

        return horas_minutos
    }

    convertirAFecha(tiempo:string)
    {
        const [horas,minutos] = tiempo.split(':').map(Number);
        const hora = new Date()
        hora.setHours(horas,minutos)

        return hora
    }

    verificarDisponibilidad(hora_inicio:Date,hora_final:Date,hora_comparacion:Date)
    {
      if(hora_comparacion>= hora_inicio && hora_comparacion<=hora_final )
      {
        return false
      }

      return true
    }
}
