import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-encuesta-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule],
  standalone: true,
  templateUrl: './encuesta-dialog.component.html',
  styleUrl: './encuesta-dialog.component.css'
})
export class EncuestaDialogComponent {


  respuesta1= '';
  respuesta2 = '';
  respuesta3 = '';



  constructor(private dialogRef: MatDialogRef<EncuestaDialogComponent>) { 

  }

  
    enviar() {
    const encuesta = {
    pregunta1: this.respuesta1,
    pregunta2: this.respuesta2,
    pregunta3: this.respuesta3
  };
    this.dialogRef.close(encuesta);
  }

  cancelar(){
    this.dialogRef.close();
  }

}
