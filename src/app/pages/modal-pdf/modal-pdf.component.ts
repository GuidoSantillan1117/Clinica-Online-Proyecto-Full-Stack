import { Component , Input, OnInit} from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-modal-pdf',
  imports: [MatDialogContent,MatButtonModule,MatDialogActions,CommonModule,FormsModule],
  standalone:true,
  templateUrl: './modal-pdf.component.html',
  styleUrl: './modal-pdf.component.css'
})
export class ModalPdfComponent implements OnInit{


  

  especialistas :any = []

  especialistaSeleccionado : any ;
  constructor(private pdf:PdfService,private dialogRef: MatDialogRef<ModalPdfComponent>,private dbService:DatabaseService,@Inject(MAT_DIALOG_DATA) public data: {id: any})
  {
    console.log(this.data.id)
  }

  ngOnInit()
  {
    this.traerEspecialistasAtendieron();
  }


  async traerEspecialistasAtendieron()
  {
    const repetidos : string [] =  [];
    const especialistas = [];
    const {dataTurno} = await this.dbService.cargarEspecialistasAtendidos(this.data.id)

    console.log(dataTurno)
       for(let turno of dataTurno!)
    {
      if(!repetidos.includes(turno.id_especialista))
      {
        repetidos.push(turno.id_especialista)
        especialistas.push(turno);
      }
    }

    this.especialistas = especialistas
  }
  // descargarPdfHistorial()
  // {
  //   this.pdf.crearPdf(this.data)
  // }

    async enviar() {
      const {data} = await this.dbService.cargarHistorialConEspecialista(this.data.id,this.especialistaSeleccionado)
      this.pdf.crearPdf(data!)
      this.dialogRef.close();
  }

  cancelar(){
    this.dialogRef.close();
  }

}
