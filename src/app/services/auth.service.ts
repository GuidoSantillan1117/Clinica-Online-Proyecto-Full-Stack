import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../clases/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  private loginValido = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  isLoggedIn$ = this._isLoggedIn.asObservable();
  loginValido$ = this.loginValido.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();



  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.checkChange();
  }

  validarLogin(){
    this.loginValido.next(true);
  }
  async cargarUsuario() {

      const { data: sessionData } = await this.supabaseService.supabase.auth.getUser();
  
      if (sessionData?.user) {
        const id = sessionData.user.id;
        const { data: userInfo } = await this.supabaseService.supabase
          .from('usuarios_clinica')
          .select('*')
          .eq('id', id)
          .single();

    if (userInfo) {
      const user = new User(userInfo.id_user,userInfo.id, userInfo.name, userInfo.sur_name, userInfo.age, userInfo.dni,userInfo.rol,userInfo.foto_perfil);
      this.currentUserSubject.next(user);
    }

    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }


  private async checkChange() {
    this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this._isLoggedIn.next(true);
        this.cargarUsuario();
      } else {
        this._isLoggedIn.next(false);
        this.loginValido.next(false);
      }
    });
  }

  async logIn(email: string, password: string) {
    return await this.supabaseService.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return await this.supabaseService.supabase.auth.signUp({ email, password });
  }

  async getUser() {
    const { data } = await this.supabaseService.supabase.auth.getUser();
    return { data }
  }

  async signOut() {
    return this.supabaseService.supabase.auth.signOut()
  }

  async getSession() {
    return this.supabaseService.supabase.auth.getSession();
  }
}

