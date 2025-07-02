import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navegacion/navbar/navbar.component";
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, animateChild, state, keyframes } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('routeAnimations', [
      transition('* => MiPerfilPage', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('800ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 })),
        animateChild()
      ]),
      transition('* <=> BienvenidaPage', [
        style({ opacity: 0 }),
        animate('800ms ease-in-out', style({ opacity: 1 }))
      ])
    ]
    )
  ]
})
export class AppComponent {


  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
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

}
