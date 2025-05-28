import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-especialidad-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule],
  standalone:true,
  templateUrl: './especialidad-dialog.component.html',
  styleUrl: './especialidad-dialog.component.css'
})
export class EspecialidadDialogComponent {

  especialidad ="";
  constructor(private dialogRef: MatDialogRef<EspecialidadDialogComponent>) {

  }

    cancelar() {
    this.dialogRef.close();
  }

  agregar() {
    this.dialogRef.close(this.especialidad);
  }
}
