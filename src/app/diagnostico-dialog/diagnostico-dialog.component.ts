import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-diagnostico-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule],
  standalone: true,
  templateUrl: './diagnostico-dialog.component.html',
  styleUrl: './diagnostico-dialog.component.css'
})
export class DiagnosticoDialogComponent {
  comentario = "";
  diagnostico = "";
  constructor(private dialogRef: MatDialogRef<DiagnosticoDialogComponent>){

  }

    cancelar() {
    this.dialogRef.close();
  }


  enviar() {
    const diagnosticoData = {
      comentario: this.comentario,
      diagnostico: this.diagnostico
    };

    this.dialogRef.close(diagnosticoData);
  }
}
