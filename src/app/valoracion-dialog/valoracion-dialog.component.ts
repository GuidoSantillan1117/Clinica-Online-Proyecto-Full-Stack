import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-valoracion-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule],
  standalone: true,
  templateUrl: './valoracion-dialog.component.html',
  styleUrl: './valoracion-dialog.component.css'
})
export class ValoracionDialogComponent {
  valoracion = 0;
  valorado = false;
  comentario = '';
  constructor(private dialogRef: MatDialogRef<ValoracionDialogComponent>)
  {
  }

  cancelar() {
    this.dialogRef.close();
  }

  valorar(puntaje:number)
  {
    this.valorado = true;
    this.valoracion = puntaje
  }

  enviar() {
    const valoracionData = {
      valoracion: this.valoracion,
      comentario: this.comentario,
    };
    this.dialogRef.close(valoracionData);
  }


}
