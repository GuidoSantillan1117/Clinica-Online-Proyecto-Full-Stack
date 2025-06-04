import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comentario-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule],
  standalone: true,
  templateUrl: './comentario-dialog.component.html',
  styleUrl: './comentario-dialog.component.css'
})
export class ComentarioDialogComponent {
  comentario ="";
  constructor(private dialogRef: MatDialogRef<ComentarioDialogComponent>) {

  }

    cancelar() {
    this.dialogRef.close();
  }

  enviar() {
    this.dialogRef.close(this.comentario);
  }
}
