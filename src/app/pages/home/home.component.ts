import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from '../../services/database.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule, RegisterComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  registroAbierto = false;
  formLogin: FormGroup = new FormGroup({
    mail: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })


  constructor(  private zone: NgZone,private supabaseAuth: AuthService, private router: Router, private snackBar: MatSnackBar, private dbService: DatabaseService) {
    this.dbService.registroOpen$.subscribe(abierto=>{
    this.zone.run(() => {
      this.registroAbierto = abierto;
    });
    })
  }


  llenarDatos(mail: string, password: string) {
    this.formLogin.setValue({
      mail: mail, password: password
    });
  }
  openRegister() {
    this.dbService.abrirRegistro();
    console.log(this.registroAbierto)
  }

  async login() {
    if (this.formLogin.valid) {
      const { data, error } = await this.supabaseAuth.logIn(this.formLogin.value.mail, this.formLogin.value.password);

      if (!error) {
        const { data: dataEspecialista, error: errorEspecialista } =
          await this.dbService.obtenerEstadoEspecialista(data.user?.id);

        if (errorEspecialista || !dataEspecialista || dataEspecialista.estado === 'Aprobado') {
          this.snackBar.open("Bienvenido a MediQ", '', {
            duration: 3000,
            panelClass: ['snackbar-bienvenido']
          });
          setTimeout(() => {
            
            this.supabaseAuth.validarLogin();
            this.dbService.subirIngreso(data.user?.id)
            localStorage.setItem('usuario', JSON.stringify(data.user));

            this.router.navigateByUrl('/bienvenida');
          }, 3000);
        }
        else if (dataEspecialista.estado === "Pendiente") {
          this.supabaseAuth.signOut();
          this.snackBar.open("Bienvenido, su solicitud de registro está pendiente de aprobación", '', {
            duration: 3000,
            panelClass: ['snackbar-bienvenido']
          });
        }
        else if (dataEspecialista.estado === "Rechazado") {
          this.supabaseAuth.signOut();
          this.snackBar.open("Usted fue rechazado por el administrador", '', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      } else {
        this.snackBar.open("Credenciales inválidas", '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

}
