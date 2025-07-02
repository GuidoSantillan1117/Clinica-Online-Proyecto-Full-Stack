import { Component } from '@angular/core';
import {trigger,transition,style,animate,animateChild,state,keyframes} from '@angular/animations';
import { RouterOutlet } from '@angular/router';
import { User } from '../../clases/User';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bienvenida',
  imports: [],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css',
})



export class BienvenidaComponent {

    usuario: User | null = null;
    private usuarioSub!: Subscription;
  constructor(private authService: AuthService)
  {
        this.usuarioSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
      }
    });
  }
}
