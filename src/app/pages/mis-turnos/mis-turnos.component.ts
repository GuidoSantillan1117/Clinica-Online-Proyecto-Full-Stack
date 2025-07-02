import { Component, OnDestroy, OnInit, Pipe } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule,TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ComentarioDialogComponent } from '../../comentario-dialog/comentario-dialog.component';
import { EncuestaDialogComponent } from '../../encuesta-dialog/encuesta-dialog.component';
import { ValoracionDialogComponent } from '../../valoracion-dialog/valoracion-dialog.component';
import { DiagnosticoDialogComponent } from '../../diagnostico-dialog/diagnostico-dialog.component';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { PipeEdadPipe } from '../../../pipeEdad.pipe';
import { ZoomDirective } from '../../../zoom.directive';
import { PipeMedidaPipe } from '../../../pipeMedida.pipe';
import { PipeGeneroPipe } from '../../../pipeGenero.pipe';


@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule, RouterModule,PipeEdadPipe,ZoomDirective,TitleCasePipe,PipeMedidaPipe,PipeGeneroPipe],
  standalone: true,
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent implements OnInit, OnDestroy {

  canal: RealtimeChannel | null = null;
  idUsuario: string | null = null;
  tipoUsuario: string | null = null;
  turnos = signal<any[]>([]);
  filtro: boolean = false;
  filtroValorActual: string = "";
  filtroValor: string = '';
  noCoincide = false;
  cantidadCoincidencias: number = 0;
  vacio = false;


  private usuarioSub!: Subscription;
  constructor(private dbService: DatabaseService, private authService: AuthService, private matDialog: MatDialog ,private supaBaseService:SupabaseService) {

    this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      this.idUsuario = user ? user.id : null;
      this.tipoUsuario = user ? user.rol : null;
    });

    this.traerTurnos();

  }

  ngOnInit() {
    console.log(this.tipoUsuario)
      this.canal = this.supaBaseService.supabase.channel("turnos");
      this.canal.on(
        "postgres_changes",
        {
          event: "*",
          table: "turnos_clinica",
          schema: "public",
        },
        async (cambios: any) => {
          if(this.tipoUsuario === 'paciente')
          {
            const {data} = await this.dbService.traerIdPaciente(this.idUsuario!) 
            if(cambios.new.id_paciente === data?.id_paciente)
            {

              this.traerTurnos();
            }
          }
          else{
            const {data} = await this.dbService.obtenerIdEspecialista(this.idUsuario!)
            if(cambios.new.id_especialista === data?.id_especialista) 
            {
              console.log("entre")
              this.traerTurnos();
            }
          }
        }
        
      );
    this.canal!.subscribe();
  }

  

  filtrar() {
    const filtrados = [];
    const filtrado = this.filtroValor

    this.filtro = true;
    this.filtroValorActual = filtrado;

    for (let turno of this.turnos()) {
      if (this.tipoUsuario === 'paciente') {
        if(turno.turnos_datos.length > 0 && ((turno.turnos_datos[0].dato_3 && (turno.turnos_datos[0].dato_3.clave == filtrado ||turno.turnos_datos[0].dato_3.valor == filtrado  )) ||(turno.turnos_datos[0].dato_2 && (turno.turnos_datos[0].dato_2.clave == filtrado ||turno.turnos_datos[0].dato_2.valor == filtrado )) ||(turno.turnos_datos[0].dato_1 && (turno.turnos_datos[0].dato_1.clave == filtrado ||turno.turnos_datos[0].dato_1.valor == filtrado  ))||turno.turnos_datos[0].altura == filtrado|| turno.turnos_datos[0].peso == filtrado|| turno.turnos_datos[0].temperatura == filtrado|| turno.turnos_datos[0].presion == filtrado))
        {
          filtrados.push(turno);
        }
        if (turno.especialistas.usuarios_clinica.name.toLocaleLowerCase() === filtrado.toLocaleLowerCase() || turno.especialidad.toLocaleLowerCase() === filtrado.toLocaleLowerCase()) {
          filtrados.push(turno);
        }

      }
      else {
        if(turno.turnos_datos.length > 0 && ((turno.turnos_datos[0].dato_3 && (turno.turnos_datos[0].dato_3.clave == filtrado ||turno.turnos_datos[0].dato_3.valor == filtrado  )) ||(turno.turnos_datos[0].dato_2 && (turno.turnos_datos[0].dato_2.clave == filtrado ||turno.turnos_datos[0].dato_2.valor == filtrado )) ||(turno.turnos_datos[0].dato_1 && (turno.turnos_datos[0].dato_1.clave == filtrado ||turno.turnos_datos[0].dato_1.valor == filtrado  ))||turno.turnos_datos[0].altura == filtrado|| turno.turnos_datos[0].peso == filtrado|| turno.turnos_datos[0].temperatura == filtrado|| turno.turnos_datos[0].presion == filtrado))

        {
          filtrados.push(turno);
        }
        if (turno.pacientes.usuarios_clinica.name.toLocaleLowerCase() === filtrado.toLocaleLowerCase() || turno.especialidad.toLocaleLowerCase() === filtrado.toLocaleLowerCase()) {
          filtrados.push(turno);
        }
      }
    }


    if (filtrados.length === 0) {
      this.noCoincide = true;
    }
    this.turnos.set(filtrados);
    this.cantidadCoincidencias = filtrados.length;
  }

  borrarFiltro() {
    this.traerTurnos();
    this.filtro = false;
    this.filtroValorActual = "";
    this.filtroValor = '';
    this.noCoincide = false;
  }

  async traerTurnos() {
    this.turnos.set([])
    if (this.idUsuario) {
      if (this.tipoUsuario === 'paciente') {
        const { data, error } = await this.dbService.cargarTurnosPaciente(this.idUsuario, this.tipoUsuario!);
        if (!error && data) {
          console.log(data)
          this.turnos.set(data);
        }
      }
      else {
        const { data, error } = await this.dbService.cargarTurnosEspecialista(this.idUsuario, this.tipoUsuario!);
        console.log(data)
        if (!error && data) {
          console.log(data)
          this.turnos.set(data);
        }
      }
    }
    if(this.turnos().length === 0)
    {
      this.vacio = true;
      console.log(this.vacio)
    }
  }

  async cancelarRechazarTurno(turno: any, cancelar: boolean) {
    let estado = cancelar ? 'Cancelado' : 'Rechazado';

    const campo = this.tipoUsuario === 'paciente' ? 'comentario_paciente' : 'comentario_especialista';
    const { error } = await this.dbService.modificarEstadoTurno(turno.id_turno, estado);
    if (!error) {
      const comentarioDialog = this.matDialog.open(ComentarioDialogComponent, {
        disableClose: true
      });

      comentarioDialog.afterClosed().subscribe(async comentario => {
        if (comentario) {
          const comentarioData = { [campo]: comentario };
          const { error } = await this.dbService.cargarComentario(turno.id_turno, comentarioData);
          turno.estado = estado;
        }
      });
    }
  }

  async aceptarTurno(turno: any) {
    const { error } = await this.dbService.modificarEstadoTurno(turno.id_turno, 'Aceptado');
    turno.estado = 'Aceptado';
  }

  async finalizarTurno(turno: any) {
    const { error } = await this.dbService.modificarEstadoTurno(turno.id_turno, 'Realizado');
    if (!error) {

      const diagnosticoDialog = this.matDialog.open(DiagnosticoDialogComponent, {
        disableClose: true
      });

      diagnosticoDialog.afterClosed().subscribe(async dataDiagnostico => {
        if (dataDiagnostico) {
          console.log(dataDiagnostico.datosExtra)
          await this.dbService.cargarComentario(turno.id_turno, {'comentario_especialista': dataDiagnostico.comentario});
          await this.dbService.cargarDiagnostico(turno.id_turno, dataDiagnostico);
          await this.dbService.cargarDatos(turno.id_turno,dataDiagnostico.altura,dataDiagnostico.peso,dataDiagnostico.temperatura,dataDiagnostico.presion,dataDiagnostico.datosExtra)
          turno.diagnostico = dataDiagnostico.diagnostico;
          turno.comentario_especialista = dataDiagnostico.comentario;
          turno.estado = 'Realizado';
        }
      })
    }


  }


  abrirComentario(turno: any) {
    {
      turno.boton_comentario_presionado = !turno.boton_comentario_presionado;
    }
  }

  abrirDiagnostico(turno: any) {
    turno.boton_diagnostico_presionado = !turno.boton_diagnostico_presionado;
  }

  abrirEncuesta(turno: any) {
    turno.boton_encuesta_presionado = !turno.boton_encuesta_presionado;
  }


  llenarEncuesta(turno: any) {
    const encuestaDialog = this.matDialog.open(EncuestaDialogComponent, {
      disableClose: true
    });
    encuestaDialog.afterClosed().subscribe(async encuesta => {
      await this.dbService.cargarEncuesta(turno.id_turno, encuesta);
      turno.encuesta_paciente = encuesta;
    })

  }

  llenarValoracion(turno: any) {

    const valoracionDialog = this.matDialog.open(ValoracionDialogComponent, {
      disableClose: true
    });
    valoracionDialog.afterClosed().subscribe(async dataValoracion => {
      if (dataValoracion) {
        await this.dbService.cargarValoracion(turno.id_turno, dataValoracion);
        turno.calificacion = dataValoracion.valoracion;
        turno.comentario_especialista = dataValoracion.comentario;
      }
    })
  }

  ngOnDestroy() {
    this.usuarioSub.unsubscribe();
    this.canal?.unsubscribe();
  }
}
