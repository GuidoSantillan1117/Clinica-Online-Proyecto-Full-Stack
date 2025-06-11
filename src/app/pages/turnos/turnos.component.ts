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

@Component({
  selector: 'app-turnos',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.css'
})
export class TurnosComponent {
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

  async traerTurnos() {

    const { data, error } = await this.dbService.cargarTurnos();
    console.log(error)
    if (!error && data) {
      this.turnos.set(data);
    }

  }


  filtrar() {
    const filtrados = [];
    const filtrado = this.filtroValor

    this.filtro = true;
    this.filtroValorActual = filtrado;

    for (let turno of this.turnos()) {

      if (turno.especialistas.usuarios_clinica.name.toLocaleLowerCase() === filtrado.toLocaleLowerCase() || turno.especialidad.toLocaleLowerCase() === filtrado.toLocaleLowerCase()) {
        filtrados.push(turno);
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

  async cancelarTurno(turno: any) {
    const { error } = await this.dbService.modificarEstadoTurno(turno.id_turno, 'Cancelado');
    if (!error) {
      const comentarioDialog = this.matDialog.open(ComentarioDialogComponent, {
        disableClose: true
      });

      comentarioDialog.afterClosed().subscribe(comentario => {
        if (comentario) {
          const comentarioData = { 'comentario_especialista': comentario };
          this.dbService.cargarComentario(turno.id_turno, comentarioData);
          turno.estado = 'Cancelado';
        }
      });
    }
  }
}

