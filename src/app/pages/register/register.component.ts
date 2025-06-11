import { Component ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EspecialidadDialogComponent } from '../../especialidad-dialog/especialidad-dialog.component';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})




export class RegisterComponent {

  @Input() administrador: any;
  registroAbierto : boolean = false;
  userType: string = "";
  edad: number = 0;
  dni: string = "";
  obra_social: string = "";
  obrasSociales: string[] = ['Medicus', 'Swiss Medical', 'Osde', 'Galeno', 'Ninguna'];
  especialidades: string[] = ['Kinesiologo', 'Pediatra', 'Ostetra', 'Dentista', 'Agregar una especialidad'];
  obraSeleccionada: string = '';
  especialidadSeleccionada: string = "";
  countClicks = 0;
  especialidadesSeleccionadas: string[] = [""];
  foto1: boolean = false;
  foto2: boolean = false;
  selected: boolean = false;
  arrayPhoto: any = [];

  registroPresionado: boolean = false;

  errorObra: boolean = false;
  errorEspecialidad: boolean = false;
  errorFotoPerfil: boolean = false;
  errorFotoFondo: boolean = false;

  formDatosPersonales: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    edad: new FormControl('', [Validators.required, Validators.min(18), Validators.max(120)]),
    dni: new FormControl('', [Validators.required, Validators.pattern(/^\d{7,8}$/)]),
  });


  formDatosUsuario: FormGroup = new FormGroup({
    mail: new FormControl('', [Validators.required, Validators.email, Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),

  })



  constructor(private router: Router, private matDialog: MatDialog, private dbService: DatabaseService, private supabaseAuth: AuthService, private snackBar: MatSnackBar) {
    this.dbService.registroOpen$.subscribe(abierto=>{
      this.registroAbierto = abierto;
    })

    
  }


  
  select(type: string) {
    this.selected = !this.selected
    this.userType = type;
  }

  volver()
  {
    this.selected = false;
  }

  cerrar()
  {
    this.dbService.cerrarRegistro();
  }

  verificarFotos() {
    if (this.arrayPhoto.length === 0) {
      this.errorFotoPerfil = true;
      this.errorFotoFondo = true;
      return false;
    }
    else if (this.userType === 'pacientes' && this.arrayPhoto.length === 1) {
      this.errorFotoFondo = true;
      return false;
    }
    return true;
  }

  verificarObraSocial() {
    console.log(this.obraSeleccionada)
    this.errorObra = false;
    if (this.obraSeleccionada == '') {
      this.errorObra = true;
      return false;
    }

    return true;
  }

  verificarEspecialidades() {
    return !this.especialidadesSeleccionadas.includes("")
  }

  verificarAgregado() {
    console.log(this.userType)
    let retorno: boolean = true;
    if (this.userType === 'pacientes') {
      retorno = this.verificarObraSocial();
    }
    else if (this.userType === 'especialistas') {
      retorno = this.verificarEspecialidades();
    }

    return retorno;
  }

  onFileSelected(event: any, photoBucket: string, index: number): void {

    if (index === 0) {
      this.errorFotoPerfil = false;
    }
    else if (index === 1) {
      this.errorFotoFondo = false;
    }
    const file = event.target.files[0];
    let filePath = `${photoBucket}_${Date.now()}`;
    if (file) {
      this.arrayPhoto[index] = { file: file, path: filePath, bucket: photoBucket, status: true }
    }

  }

  selectEspecialidad(especialidad: string, index: number) {
    if (especialidad === "Agregar una especialidad") {
      const dialogEsp = this.matDialog.open(EspecialidadDialogComponent, {
        disableClose: true
      });
      dialogEsp.afterClosed().subscribe(resultado => {
        if (resultado) {
          const indexFinal = this.especialidades.length - 1;
          this.especialidades.splice(indexFinal, 0, resultado)
          this.especialidadesSeleccionadas[index] = resultado;
        }
        else {
          this.especialidadesSeleccionadas[index] = "";
        }
      });
    }
    else {
      this.especialidadesSeleccionadas[index] = especialidad
      console.log(this.especialidadesSeleccionadas[index])
    }
  }

  addEspecialidad() {
    if (this.countClicks >= 3) {
      console.log("No se pueden añadir más");
    }
    else {
      if (this.verificarEspecialidades()) {
        this.especialidadesSeleccionadas.push("");
        this.countClicks++
      }
    }

  }


  async register(table: string) {
    this.registroPresionado = false;
    const rol = table === 'pacientes' ? 'paciente'
      : table === 'especialistas' ? 'especialista'
        : 'administrador';
    const verifacionFoto = this.verificarFotos();
    const verifacionAgregado = this.verificarAgregado();
    if (!this.formDatosPersonales.invalid && !this.formDatosUsuario.invalid && verifacionFoto && verifacionAgregado) {
      const { data, error } = await this.supabaseAuth.signUp(this.formDatosUsuario.value.mail, this.formDatosUsuario.value.password)

      if (!error) {
        const { error: errorUser } = await this.dbService.insertSignUp(data.user?.id, this.formDatosPersonales.value.nombre,
          this.formDatosPersonales.value.apellido, this.formDatosPersonales.value.edad, Number(this.formDatosPersonales.value.dni), rol)

        if (!errorUser) {
          if (table === "pacientes") {

            await this.dbService.insertSignUpPaciente(table, this.obraSeleccionada, data.user?.id!)
          }
          else if (table === "especialistas") {
            await this.dbService.insertSignUpEspecialista(table, data.user?.id!, this.especialidadesSeleccionadas)
          }
          else {
            await this.dbService.insertSignUpAdmin(table, data.user?.id!)
          }

          for (let foto of this.arrayPhoto) {
            await this.dbService.insertPhoto(foto.path, data.user?.id!, foto.file, foto.bucket)
          }
          this.supabaseAuth.logIn(this.formDatosUsuario.value.mail, this.formDatosUsuario.value.password);
          this.snackBar.open("Usuario creado correctamente. Bienvenido a MediQ", '', {
            duration: 3000,
            panelClass: ['snackbar-bienvenido']
          });
          setTimeout(() => {
            this.cerrar();
          }, 1500);

        }
      }
      else {
        this.registroPresionado = true;
        this.snackBar.open("ERROR. Ya existe un usuario con ese correo", '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }

    }
    else {
      this.registroPresionado = true;
    }

  }
}


