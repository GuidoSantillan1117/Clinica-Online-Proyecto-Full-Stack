import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EspecialidadDialogComponent } from '../../especialidad-dialog/especialidad-dialog.component';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  selectedFile: File | null = null;
  userType :string = "";
  nombre:string = "";
  apellido:string = "";
  mail:string ="";
  password:string ="";
  edad:number =0;
  dni:number = 0
  obra_social:string = "";
  maxEspeciality :number = 1;
  obrasSociales: string[] = ['Medicus', 'Swiss Medical', 'Osde', 'Galeno','Ninguna'];
  especialidades : string[] = ['Kinesiologo','Pediatra','Ostetra','Dentista','Agregar una especialidad'];
  obraSeleccionada: string = '';
  especialidadSeleccionada : string = "";
  countClicks = 0;
  especialidadesSeleccionadas : string [] = [""];
  selected : boolean = false;
  arrayPhoto : any = [];

  constructor(private router:Router,private matDialog : MatDialog , private dbService:DatabaseService, private supabaseAuth: AuthService,private snackBar:MatSnackBar) {

  }

  select(type:string)
  {
    this.selected = !this.selected
    this.userType = type;
  }

  onFileSelected(event: any,photoBucket:string,index:number): void {
  const file = event.target.files[0];
  let filePath = `${this.nombre}_${Date.now()}`;
  if (file) 
    {
      this.arrayPhoto[index] = {file:file,path:filePath,bucket:photoBucket}
    }

  }

  selectEspecialidad(especialidad:string,index:number)
  {
    if(especialidad ==="Agregar una especialidad")
    {
     const dialogEsp = this.matDialog.open(EspecialidadDialogComponent,{
        disableClose : true
      });
        dialogEsp.afterClosed().subscribe(resultado => {
          if (resultado) {
            const indexFinal = this.especialidades.length - 1;
            this.especialidades.splice(indexFinal,0,resultado)
            this.especialidadesSeleccionadas[index] = resultado;
          }
          else{
            this.especialidadesSeleccionadas[index] = "";
          } 
        });
    }
    else{
      this.especialidadesSeleccionadas[index] = especialidad
      console.log(this.especialidadesSeleccionadas[index])
    }
  }

  addEspecialidad()
  {
    if(this.countClicks >=3)
    {
      console.log("No se pueden añadir más");
    }
    else{
      if(!this.especialidadesSeleccionadas.includes(""))
      {
        this.especialidadesSeleccionadas.push("");
        this.countClicks++

      }
    }

  }


  async register(table:string)
  {
   const {data,error} = await this.supabaseAuth.signUp(this.mail,this.password)
      if(!error)
      {
        const {error} = await this.dbService.insertSignUp(data.user?.id,this.nombre,this.apellido,this.edad,this.mail,this.dni)

        if(!error)
          {
            for(let foto of this.arrayPhoto)
            {
              this.dbService.insertPhoto(foto.path,data.user?.id!,foto.file,foto.bucket,table)
            }

            if(table ==="pacientes")
            {
              this.dbService.insertSignUpPaciente(table,this.obraSeleccionada,data.user?.id!,this.arrayPhoto[0].path,this.arrayPhoto[1].path)
            }
            else if (table ==="especialistas")
            {
              this.dbService.insertSignUpEspecialista(table,data.user?.id!,this.arrayPhoto[0].path,this.especialidadesSeleccionadas)
            }
            else{
              this.dbService.insertSignUpAdmin(table,data.user?.id!,this.arrayPhoto[0].path)
            }
            
            this.supabaseAuth.logIn(this.mail,this.password)
            this.snackBar.open("Usuario creado correctamente. Bienvenido a MediQ", '', {
              duration: 3000, 
              panelClass: ['snackbar'] 
            });
            setTimeout(() => {
              this.router.navigateByUrl('/home');
            }, 3200);
            
        }
      }
  }
}


