import { Component ,OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router,RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  standalone:true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy {

  rolActual : string | null = null;
  private rolSub!: Subscription;


  constructor(private router: Router,private authService: AuthService) { 
    this.rolSub = this.authService.currentUser$.subscribe(user => {
      this.rolActual = user ? user.rol : null;
    });
    
  }

  ngOnDestroy(): void {
    this.rolSub.unsubscribe();
  }
  async salir(){
    this.authService.signOut();
    this.router.navigateByUrl('/home');
  }

  mostrar()
  {
    console.log(this.rolActual);
  }

}
