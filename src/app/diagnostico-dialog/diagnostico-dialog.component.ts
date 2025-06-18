import { Component } from '@angular/core';
import { MatDialogRef,MatDialogActions,MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-diagnostico-dialog',
  imports: [FormsModule,CommonModule,MatDialogActions,MatDialogContent,MatButtonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './diagnostico-dialog.component.html',
  styleUrl: './diagnostico-dialog.component.css'
})
export class DiagnosticoDialogComponent {

  indexDatos = 0;
  datosAgregados = 0
  formDiagnostico = new FormGroup({
    altura: new FormControl('',[Validators.required,Validators.maxLength(5),Validators.pattern(/^\d{1,3}(\.\d{1,2})?$/)]),
    peso : new FormControl('',[Validators.required,Validators.maxLength(5),Validators.pattern(/^\d{1,3}(\.\d{1,2})?$/)]),
    temperatura : new FormControl ('',[Validators.required,Validators.maxLength(5),Validators.pattern(/^\d{1,2}(\.\d{1,2})?$/)]),
    presion : new FormControl ('',[Validators.required,Validators.maxLength(5),Validators.pattern(/^\d{2,3}(\.\d{1,2})?$/)]),
    comentario : new FormControl ('',[Validators.required,Validators.minLength(5)]),
    diagnostico : new FormControl ('',[Validators.required,Validators.minLength(4)]),
    datosExtra : new FormArray([])
  })
  

  constructor(private dialogRef: MatDialogRef<DiagnosticoDialogComponent>){

  }

    cancelar() {
    this.dialogRef.close();
  }

  get datosExtra(){
    return this.formDiagnostico.get('datosExtra') as FormArray;
  }

  agregarDatoExtra() {

    if(this.datosExtra.length>0)
    {
      for(let grupo of this.datosExtra.controls)
      {
        if(grupo.get('clave')?.invalid ||grupo.get('valor')?.invalid)
        {
          return
        }
      }
    }
    this.datosExtra.push( new FormGroup({
      clave: new FormControl ('',[Validators.required,Validators.minLength(4)]),
      valor : new FormControl ('',[Validators.required,Validators.minLength(4)]),
    }))

  }
  enviar() {
    const arrayDatos = []
    for (let grupo of this.datosExtra.controls)
    {
      const clave = grupo.value.clave
      const valor = grupo.value.valor
      arrayDatos.push({clave:clave,valor:valor})

      
    }
    const diagnosticoData = {
      altura: this.formDiagnostico.value.altura,
      peso: this.formDiagnostico.value.peso,
      temperatura: this.formDiagnostico.value.temperatura,
      presion:this.formDiagnostico.value.presion,
      datosExtra:arrayDatos,
      comentario: this.formDiagnostico.value.comentario,
      diagnostico: this.formDiagnostico.value.diagnostico
    };

    this.dialogRef.close(diagnosticoData);
  }
}
