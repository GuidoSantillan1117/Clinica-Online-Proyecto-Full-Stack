import { Component, OnDestroy, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent implements OnInit, OnDestroy {

  idUsuario: string | null = null;
  tipoUsuario: string | null = null;
  turnos = signal<any[]>([]);
  filtro: boolean = false;
  filtroValorActual: string = "";
  filtroValor: string = '';
  noCoincide = false;
  cantidadCoincidencias: number = 0;


  private usuarioSub!: Subscription;
  constructor(private dbService: DatabaseService, private authService: AuthService, private matDialog: MatDialog) {

    this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      this.idUsuario = user ? user.id : null;
      this.tipoUsuario = user ? user.rol : null;
    });

    this.traerTurnos();

  }

  ngOnInit() {
    // this.traerTurnos();
  }

  filtrar() {
    const filtrados = [];
    const filtrado = this.filtroValor

    const nombre = this.tipoUsuario === 'paciente' ? 'paciente' : 'especialista';
    this.filtro = true;
    this.filtroValorActual = filtrado;

    for (let turno of this.turnos()) {
      if (this.tipoUsuario === 'paciente') {
        if (turno.especialistas.usuarios_clinica.name.toLocaleLowerCase() === filtrado.toLocaleLowerCase() || turno.especialidad.toLocaleLowerCase() === filtrado.toLocaleLowerCase()) {
          filtrados.push(turno);
        }

      }
      else {
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
    if (this.idUsuario) {
      if (this.tipoUsuario === 'paciente') {
        const { data, error } = await this.dbService.cargarTurnosPaciente(this.idUsuario, this.tipoUsuario!);
        if (!error && data) {
          this.turnos.set(data);
        }
      }
      else {
        const { data, error } = await this.dbService.cargarTurnosEspecialista(this.idUsuario, this.tipoUsuario!);
        if (!error && data) {
          this.turnos.set(data);
        }
      }
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
  }
}
