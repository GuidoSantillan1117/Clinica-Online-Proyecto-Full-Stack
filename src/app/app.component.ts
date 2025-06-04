import { Component ,OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navegacion/navbar/navbar.component";
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'parcial2';
  isLogged: boolean = false;
  loginValido: boolean = false;
  private authSub!: Subscription;
  private loginValidoSub!: Subscription;


  constructor(private supabaseAuth: AuthService) {
    this.authSub = this.supabaseAuth.isLoggedIn$.subscribe(logged => {
      this.isLogged = logged;
    });

    this.loginValidoSub = this.supabaseAuth.loginValido$.subscribe(valido => {
      this.loginValido = valido;
    });


  }

  ngOnInit(): void {
    this.supabaseAuth.signOut();
  }
}
